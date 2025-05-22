
import { Ticket, LogEntry, ApiResponse } from "@/lib/types";
import { ticketService } from "@/services";
import { toast } from "@/hooks/use-toast";

/**
 * Factory function to create ticket action handlers
 */
export const createTicketActions = (
  updateTicketStatus: (id: string, status: Ticket["status"]) => void,
  addLogEntry: (log: Omit<LogEntry, "id">) => void,
  getTicket: (id: string) => Ticket | undefined
) => {
  /**
   * Send ticket to OPS system
   */
  const sendTicketToOps = async (ticket: Ticket): Promise<ApiResponse> => {
    try {
      // Update ticket status to pending
      updateTicketStatus(ticket.id, "pending");

      // Call backend service
      const response = await ticketService.sendTicketToOps(ticket);

      // Update ticket status based on response
      if (response.success) {
        updateTicketStatus(ticket.id, "sent");
      } else {
        updateTicketStatus(ticket.id, "failed");
      }

      // Add log entry
      addLogEntry({
        ticketId: ticket.id,
        action: "send",
        status: response.success ? "success" : "failed",
        timestamp: new Date().toISOString(),
        response,
      });

      // Show toast notification
      toast({
        title: response.success ? "Success" : "Error",
        description: response.message,
        variant: response.success ? "default" : "destructive",
      });

      return response;
    } catch (error) {
      const errorResponse: ApiResponse = {
        success: false,
        message: "An unexpected error occurred",
        data: { error: error instanceof Error ? error.message : String(error) },
        timestamp: new Date().toISOString(),
      };

      // Update ticket status to failed
      updateTicketStatus(ticket.id, "failed");

      // Add log entry
      addLogEntry({
        ticketId: ticket.id,
        action: "send",
        status: "failed",
        timestamp: new Date().toISOString(),
        response: errorResponse,
      });

      // Show error toast
      toast({
        title: "Error",
        description: "Failed to send ticket to OPS system",
        variant: "destructive",
      });

      return errorResponse;
    }
  };

  /**
   * Query ticket status from OPS system
   */
  const queryTicketStatus = async (id: string): Promise<ApiResponse> => {
    try {
      const ticket = getTicket(id);
      
      if (!ticket) {
        const errorResponse: ApiResponse = {
          success: false,
          message: "Ticket not found",
          timestamp: new Date().toISOString(),
        };
        return errorResponse;
      }

      // Only query status for tickets that have been sent
      if (ticket.status !== "sent" && 
          ticket.status !== "in_progress" && 
          ticket.status !== "closed" && 
          ticket.status !== "delayed") {
        const errorResponse: ApiResponse = {
          success: false,
          message: `Cannot query status for ticket in '${ticket.status}' state`,
          timestamp: new Date().toISOString(),
        };
        return errorResponse;
      }

      // Call backend service to query status
      const response = await ticketService.queryTicketStatus(id);

      if (response.success && response.data?.status) {
        // Update ticket status based on API response
        updateTicketStatus(id, response.data.status);
        
        // Add log entry
        addLogEntry({
          ticketId: id,
          action: "query",
          status: "success",
          timestamp: new Date().toISOString(),
          response,
        });
      }

      // Show toast notification
      toast({
        title: response.success ? "Status Updated" : "Error",
        description: response.message,
        variant: response.success ? "default" : "destructive",
      });

      return response;
    } catch (error) {
      const errorResponse: ApiResponse = {
        success: false,
        message: "Error querying ticket status",
        data: { error: error instanceof Error ? error.message : String(error) },
        timestamp: new Date().toISOString(),
      };

      // Add log entry
      addLogEntry({
        ticketId: id,
        action: "query",
        status: "failed",
        timestamp: new Date().toISOString(),
        response: errorResponse,
      });

      // Show error toast
      toast({
        title: "Error",
        description: "Failed to query ticket status",
        variant: "destructive",
      });

      return errorResponse;
    }
  };

  return {
    sendTicketToOps,
    queryTicketStatus,
  };
};
