
# Ticket OPS Management Backend

This is a Go backend service for the Ticket OPS Management system. It provides APIs for ticket management, including sending tickets to an OPS system and querying their status.

## Features

- RESTful API for ticket management (CRUD operations)
- OPS system integration simulation
- Logging of all API communications
- PostgreSQL database integration

## Prerequisites

- Go 1.18 or later
- PostgreSQL 12 or later
- Docker (optional, for containerized deployment)

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and update the environment variables
3. Install dependencies:
   ```
   go mod download
   ```
4. Run the server:
   ```
   go run main.go
   ```

## Environment Variables

- `PORT`: Port number for the server (default: 4040)
- `DATABASE_URL`: PostgreSQL connection string

## API Endpoints

### Ticket Management

- `GET /tickets` - Get all tickets
- `GET /tickets/{id}` - Get a specific ticket
- `POST /tickets` - Create a new ticket
- `PUT /tickets/{id}` - Update an existing ticket
- `DELETE /tickets/{id}` - Delete a ticket

### OPS Integration

- `POST /api/ops/{id}` - Send a ticket to the OPS system
- `GET /api/status/{id}` - Query the status of a ticket in the OPS system

## Database Schema

### Tickets Table

- `id` (string, primary key) - Unique identifier for the ticket
- `subject` (string) - Ticket subject
- `description` (string) - Ticket description
- `status` (string) - Current status of the ticket
- `created_at` (timestamp) - Creation timestamp
- `customer_name` (string) - Customer name
- `customer_email` (string) - Customer email
- `customer_phone` (string, optional) - Customer phone
- `assigned_to` (string, optional) - Person assigned to the ticket
- `priority` (string) - Ticket priority (low, medium, high)
- `category` (string) - Ticket category
- `metadata` (jsonb, optional) - Additional metadata

### Log Entries Table

- `id` (string, primary key) - Unique identifier for the log entry
- `ticket_id` (string) - Related ticket ID
- `action` (string) - Action performed (send, retry, query)
- `status` (string) - Status of the action (success, failed)
- `timestamp` (timestamp) - When the action occurred
- `response` (jsonb) - API response data
