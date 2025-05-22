
import { backendService } from "./backendService";
import { mockBackendService } from "./mockBackendService";

// Environment check
// Set to false to use the Go backend
const USE_MOCK_BACKEND = false;

// Export the appropriate service based on environment
export const ticketService = USE_MOCK_BACKEND ? mockBackendService : backendService;
