
package models

import (
	"time"
	
	"gorm.io/gorm"
)

// TicketStatus represents the status of a ticket
type TicketStatus string

const (
	StatusNew        TicketStatus = "new"
	StatusPending    TicketStatus = "pending"
	StatusSent       TicketStatus = "sent"
	StatusInProgress TicketStatus = "in_progress"
	StatusClosed     TicketStatus = "closed"
	StatusDelayed    TicketStatus = "delayed"
	StatusFailed     TicketStatus = "failed"
)

// Priority represents the priority level of a ticket
type Priority string

const (
	PriorityLow    Priority = "low"
	PriorityMedium Priority = "medium"
	PriorityHigh   Priority = "high"
)

// Customer represents customer details in a ticket
type Customer struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	Phone string `json:"phone,omitempty"`
}

// Ticket represents a ticket in the system
type Ticket struct {
	ID          string      `gorm:"primaryKey" json:"id"`
	Subject     string      `json:"subject"`
	Description string      `json:"description"`
	Status      TicketStatus `json:"status"`
	CreatedAt   time.Time   `json:"createdAt"`
	Customer    Customer    `gorm:"embedded" json:"customer"`
	AssignedTo  string      `json:"assignedTo,omitempty"`
	Priority    Priority    `json:"priority"`
	Category    string      `json:"category"`
	Metadata    []byte      `gorm:"type:jsonb" json:"-"` // JSON data stored as bytes
}

// BeforeCreate is a GORM hook that runs before creating a record
func (t *Ticket) BeforeCreate(tx *gorm.DB) error {
	if t.Status == "" {
		t.Status = StatusNew
	}
	if t.CreatedAt.IsZero() {
		t.CreatedAt = time.Now()
	}
	return nil
}
