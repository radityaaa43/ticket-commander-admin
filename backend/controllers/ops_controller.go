package controllers

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"gorm.io/gorm"

	"backend/models"
)

// OpsController handles operations related to the OPS system
type OpsController struct {
	DB *gorm.DB
}

// NewOpsController creates a new OPS controller
func NewOpsController(db *gorm.DB) *OpsController {
	return &OpsController{DB: db}
}

// SendToOps handles sending a ticket to the OPS system
func (c *OpsController) SendToOps(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	// Find the ticket
	var ticket models.Ticket
	result := c.DB.First(&ticket, "id = ?", id)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			sendErrorResponse(w, "Ticket not found", http.StatusNotFound)
		} else {
			sendErrorResponse(w, result.Error.Error(), http.StatusInternalServerError)
		}
		return
	}

	// Simulate OPS integration with some randomness for demo purposes
	success := simulateOpsSuccess()
	
	// Create response
	var response models.ApiResponse
	timestamp := time.Now()

	if success {
		// Update ticket status
		ticket.Status = models.StatusSent
		if err := c.DB.Save(&ticket).Error; err != nil {
			sendErrorResponse(w, err.Error(), http.StatusInternalServerError)
			return
		}

		response = models.ApiResponse{
			Success:   true,
			Message:   fmt.Sprintf("Ticket %s successfully sent to OPS", id),
			Timestamp: timestamp,
			Data: map[string]interface{}{
				"ticketId":  id,
				"opsId":     fmt.Sprintf("OPS-%s", uuid.NewString()[0:8]),
				"timestamp": timestamp,
			},
		}
	} else {
		// Simulate failure
		response = models.ApiResponse{
			Success:   false,
			Message:   fmt.Sprintf("Failed to send ticket %s to OPS: connection timeout", id),
			Timestamp: timestamp,
		}
	}

	// Create log entry
	logEntry := models.LogEntry{
		ID:        uuid.NewString(),
		TicketID:  id,
		Action:    models.ActionSend,
		Status:    getStatusType(success),
		Timestamp: timestamp,
		ResponseObj: response,
	}

	// Convert response to JSON for storage
	responseBytes, err := json.Marshal(response)
	if err != nil {
		log.Printf("Error marshalling response: %v", err)
		sendErrorResponse(w, "Error creating log entry", http.StatusInternalServerError)
		return
	}
	logEntry.Response = responseBytes

	// Save log entry
	if err := c.DB.Create(&logEntry).Error; err != nil {
		log.Printf("Error saving log entry: %v", err)
		sendErrorResponse(w, "Error creating log entry", http.StatusInternalServerError)
		return
	}

	// Send the response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// QueryStatus checks the status of a ticket in the OPS system
func (c *OpsController) QueryStatus(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	// Find the ticket
	var ticket models.Ticket
	result := c.DB.First(&ticket, "id = ?", id)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			sendErrorResponse(w, "Ticket not found", http.StatusNotFound)
		} else {
			sendErrorResponse(w, result.Error.Error(), http.StatusInternalServerError)
		}
		return
	}

	// Check if ticket is in a state that can be queried
	if ticket.Status != models.StatusSent && 
	   ticket.Status != models.StatusInProgress && 
	   ticket.Status != models.StatusClosed && 
	   ticket.Status != models.StatusDelayed {
		sendErrorResponse(w, fmt.Sprintf("Cannot query status for ticket in '%s' state", ticket.Status), http.StatusBadRequest)
		return
	}

	// Simulate status check with randomness
	success, newStatus := simulateStatusCheck(ticket.Status)
	
	// Create response
	var response models.ApiResponse
	timestamp := time.Now()

	if success {
		// Update ticket status if it changed
		if newStatus != ticket.Status {
			ticket.Status = newStatus
			if err := c.DB.Save(&ticket).Error; err != nil {
				sendErrorResponse(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}

		response = models.ApiResponse{
			Success:   true,
			Message:   fmt.Sprintf("Status for ticket %s: %s", id, newStatus),
			Timestamp: timestamp,
			Data: map[string]interface{}{
				"ticketId": id,
				"status":   newStatus,
				"updated":  newStatus != ticket.Status,
				"details":  getStatusDetails(newStatus),
			},
		}
	} else {
		// Simulate failure
		response = models.ApiResponse{
			Success:   false,
			Message:   fmt.Sprintf("Failed to query status for ticket %s: OPS system unavailable", id),
			Timestamp: timestamp,
		}
	}

	// Create log entry
	logEntry := models.LogEntry{
		ID:        uuid.NewString(),
		TicketID:  id,
		Action:    models.ActionQuery,
		Status:    getStatusType(success),
		Timestamp: timestamp,
		ResponseObj: response,
	}

	// Convert response to JSON for storage
	responseBytes, err := json.Marshal(response)
	if err != nil {
		log.Printf("Error marshalling response: %v", err)
		sendErrorResponse(w, "Error creating log entry", http.StatusInternalServerError)
		return
	}
	logEntry.Response = responseBytes

	// Save log entry
	if err := c.DB.Create(&logEntry).Error; err != nil {
		log.Printf("Error saving log entry: %v", err)
		sendErrorResponse(w, "Error creating log entry", http.StatusInternalServerError)
		return
	}

	// Send the response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Helper functions

// simulateOpsSuccess simulates success/failure of OPS operations with randomness
// but biased toward success (80% success rate)
func simulateOpsSuccess() bool {
	rand.Seed(time.Now().UnixNano())
	return rand.Float32() <= 0.8
}

// simulateStatusCheck simulates checking a ticket status
// Returns success (bool) and the new status
func simulateStatusCheck(currentStatus models.TicketStatus) (bool, models.TicketStatus) {
	rand.Seed(time.Now().UnixNano())
	
	// 90% chance of success for status check
	success := rand.Float32() <= 0.9
	if !success {
		return false, currentStatus
	}
	
	// Determine potential status transitions
	switch currentStatus {
	case models.StatusSent:
		// Sent -> In Progress (70%), Delayed (20%), Failed (10%)
		r := rand.Float32()
		if r < 0.7 {
			return true, models.StatusInProgress
		} else if r < 0.9 {
			return true, models.StatusDelayed
		} else {
			return true, models.StatusFailed
		}
	case models.StatusInProgress:
		// In Progress -> Still In Progress (60%), Closed (40%)
		if rand.Float32() < 0.6 {
			return true, models.StatusInProgress
		} else {
			return true, models.StatusClosed
		}
	case models.StatusDelayed:
		// Delayed -> Still Delayed (50%), In Progress (40%), Failed (10%)
		r := rand.Float32()
		if r < 0.5 {
			return true, models.StatusDelayed
		} else if r < 0.9 {
			return true, models.StatusInProgress
		} else {
			return true, models.StatusFailed
		}
	default:
		// All other statuses remain the same
		return true, currentStatus
	}
}

// getStatusType converts boolean success to StatusType
func getStatusType(success bool) models.StatusType {
	if success {
		return models.StatusSuccess
	}
	return models.StatusFailed
}

// getStatusDetails returns details about a status for the API response
func getStatusDetails(status models.TicketStatus) string {
	switch status {
	case models.StatusNew:
		return "Ticket is new and awaiting processing"
	case models.StatusPending:
		return "Ticket is pending submission to OPS"
	case models.StatusSent:
		return "Ticket has been sent to OPS and is awaiting processing"
	case models.StatusInProgress:
		return "Ticket is being processed by OPS"
	case models.StatusClosed:
		return "Ticket has been processed and closed"
	case models.StatusDelayed:
		return "Ticket processing has been delayed"
	case models.StatusFailed:
		return "Ticket processing failed"
	default:
		return "Unknown status"
	}
}

// sendErrorResponse sends an error response with the given message and status code
func sendErrorResponse(w http.ResponseWriter, message string, statusCode int) {
	response := models.ApiResponse{
		Success:   false,
		Message:   message,
		Timestamp: time.Now(),
	}
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(response)
}
