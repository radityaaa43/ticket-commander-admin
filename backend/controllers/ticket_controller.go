
package controllers

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"gorm.io/gorm"

	"backend/models"
)

// TicketController handles HTTP requests related to tickets
type TicketController struct {
	DB *gorm.DB
}

// NewTicketController creates a new ticket controller
func NewTicketController(db *gorm.DB) *TicketController {
	return &TicketController{DB: db}
}

// GetAllTickets retrieves all tickets from the database
func (c *TicketController) GetAllTickets(w http.ResponseWriter, r *http.Request) {
	var tickets []models.Ticket
	result := c.DB.Find(&tickets)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tickets)
}

// GetTicket retrieves a specific ticket by ID
func (c *TicketController) GetTicket(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var ticket models.Ticket
	result := c.DB.First(&ticket, "id = ?", id)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			http.Error(w, "Ticket not found", http.StatusNotFound)
		} else {
			http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ticket)
}

// CreateTicket creates a new ticket
func (c *TicketController) CreateTicket(w http.ResponseWriter, r *http.Request) {
	var ticket models.Ticket
	err := json.NewDecoder(r.Body).Decode(&ticket)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Generate a UUID for the ticket if not provided
	if ticket.ID == "" {
		ticket.ID = uuid.NewString()
	}
	
	// Set default values
	if ticket.CreatedAt.IsZero() {
		ticket.CreatedAt = time.Now()
	}
	if ticket.Status == "" {
		ticket.Status = models.StatusNew
	}

	result := c.DB.Create(&ticket)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(ticket)
}

// UpdateTicket updates an existing ticket
func (c *TicketController) UpdateTicket(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var ticket models.Ticket
	err := json.NewDecoder(r.Body).Decode(&ticket)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Ensure ID matches the URL parameter
	ticket.ID = id

	// First check if the ticket exists
	var existingTicket models.Ticket
	result := c.DB.First(&existingTicket, "id = ?", id)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			http.Error(w, "Ticket not found", http.StatusNotFound)
		} else {
			http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		}
		return
	}

	// Update the ticket
	result = c.DB.Save(&ticket)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ticket)
}

// DeleteTicket deletes a ticket by ID
func (c *TicketController) DeleteTicket(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	result := c.DB.Delete(&models.Ticket{}, "id = ?", id)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	if result.RowsAffected == 0 {
		http.Error(w, "Ticket not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
