
import { Ticket, ApiResponse, TicketStatus } from "@/lib/types";
import { toast } from "@/hooks/use-toast";

// Backend API endpoints
const TICKET_API_ENDPOINT = "http://localhost:4040/tickets";
const OPS_API_ENDPOINT = "http://localhost:8089/api/ops";
const STATUS_API_ENDPOINT = "http://localhost:8089/api/status";

/**
 * Service to handle backend API requests for tickets
 */
export const backendService = {
  /**
   * Fetch all tickets from the backend
   */
  async fetchAllTickets(): Promise<Ticket[]> {
    try {
      console.log("Fetching tickets from:", TICKET_API_ENDPOINT);
      const response = await fetch(TICKET_API_ENDPOINT);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tickets: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast({
        title: "Error",
        description: "Failed to fetch tickets from the server",
        variant: "destructive",
      });
      // Return empty array to prevent UI from crashing
      return [];
    }
  },

  /**
   * Fetch a single ticket by ID
   */
  async fetchTicket(id: string): Promise<Ticket | null> {
    try {
      console.log(`Fetching ticket ${id} from:`, `${TICKET_API_ENDPOINT}/${id}`);
      const response = await fetch(`${TICKET_API_ENDPOINT}/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ticket: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ticket ${id}:`, error);
      toast({
        title: "Error",
        description: `Failed to fetch ticket ${id}`,
        variant: "destructive",
      });
      return null;
    }
  },

  /**
   * Send a ticket to OPS system
   */
  async sendTicketToOps(ticket: Ticket): Promise<ApiResponse> {
    try {
      console.log("Sending ticket to OPS:", `${OPS_API_ENDPOINT}/${ticket.id}`);
      
      const response = await fetch(`${OPS_API_ENDPOINT}/${ticket.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ticket),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to send ticket to OPS");
      }
      
      return result;
    } catch (error) {
      console.error("Error sending ticket to OPS:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to send ticket to OPS",
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Query ticket status from OPS system
   */
  async queryTicketStatus(id: string): Promise<ApiResponse> {
    try {
      console.log("Querying ticket status:", `${STATUS_API_ENDPOINT}/${id}`);
      
      const response = await fetch(`${STATUS_API_ENDPOINT}/${id}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || `Failed to query status for ticket ${id}`);
      }
      
      return result;
    } catch (error) {
      console.error(`Error querying status for ticket ${id}:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : `Failed to query status for ticket ${id}`,
        timestamp: new Date().toISOString(),
      };
    }
  },
};

