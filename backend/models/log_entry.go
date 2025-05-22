
package models

import (
	"time"
)

// ActionType represents the type of action performed
type ActionType string

const (
	ActionSend  ActionType = "send"
	ActionRetry ActionType = "retry"
	ActionQuery ActionType = "query"
)

// StatusType represents the status of an action
type StatusType string

const (
	StatusSuccess StatusType = "success"
	StatusFailed  StatusType = "failed"
)

// ApiResponse represents a response from the API
type ApiResponse struct {
	Success   bool        `json:"success"`
	Message   string      `json:"message"`
	Data      interface{} `json:"data,omitempty"`
	Timestamp time.Time   `json:"timestamp"`
}

// LogEntry represents a log entry in the system
type LogEntry struct {
	ID        string      `gorm:"primaryKey" json:"id"`
	TicketID  string      `json:"ticketId"`
	Action    ActionType  `json:"action"`
	Status    StatusType  `json:"status"`
	Timestamp time.Time   `json:"timestamp"`
	Response  []byte      `gorm:"type:jsonb" json:"-"` // JSON data stored as bytes
	ResponseObj ApiResponse `gorm:"-" json:"response"` // Used for JSON serialization
}
