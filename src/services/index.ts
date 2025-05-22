
import { backendService } from "./backendService";
import { mockBackendService } from "./mockBackendService";

// Environment check
// In a real application, this would be based on environment variables
const USE_MOCK_BACKEND = true; // Set to false to use real backend

// Export the appropriate service based on environment
export const ticketService = USE_MOCK_BACKEND ? mockBackendService : backendService;

