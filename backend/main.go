
package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"backend/controllers"
	"backend/models"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Get port from environment, default to 4040
	port := os.Getenv("PORT")
	if port == "" {
		port = "4040"
	}

	// Get database connection string
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	// Initialize database connection
	db, err := gorm.Open(postgres.Open(dbURL), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Auto migrate the schema
	if err := db.AutoMigrate(&models.Ticket{}, &models.LogEntry{}); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// Initialize router
	router := mux.NewRouter()

	// Create controllers with db instance
	ticketController := controllers.NewTicketController(db)
	opsController := controllers.NewOpsController(db)

	// Set up API routes
	router.HandleFunc("/tickets", ticketController.GetAllTickets).Methods("GET")
	router.HandleFunc("/tickets/{id}", ticketController.GetTicket).Methods("GET")
	router.HandleFunc("/tickets", ticketController.CreateTicket).Methods("POST")
	router.HandleFunc("/tickets/{id}", ticketController.UpdateTicket).Methods("PUT")
	router.HandleFunc("/tickets/{id}", ticketController.DeleteTicket).Methods("DELETE")
	
	// OPS system routes
	router.HandleFunc("/api/ops/{id}", opsController.SendToOps).Methods("POST")
	router.HandleFunc("/api/status/{id}", opsController.QueryStatus).Methods("GET")

	// Configure CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"}, // Allows all origins
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})

	// Use CORS middleware
	handler := c.Handler(router)

	// Start the server
	serverAddr := fmt.Sprintf(":%s", port)
	log.Printf("Server listening on port %s", port)
	log.Fatal(http.ListenAndServe(serverAddr, handler))
}
