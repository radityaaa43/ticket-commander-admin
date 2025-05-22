
import { Ticket, ApiResponse, TicketStatus } from "@/lib/types";
import mockData, { mockSendToOps, mockQueryTicketStatus } from "@/lib/mockData";

/**
 * Mock service to simulate backend API requests for tickets during development
 */
export const mockBackendService = {
  /**
   * Fetch all tickets (mock)
   */
  async fetchAllTickets(): Promise<Ticket[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockData.tickets;
  },

  /**
   * Fetch a single ticket by ID (mock)
   */
  async fetchTicket(id: string): Promise<Ticket | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const ticket = mockData.tickets.find(ticket => ticket.id === id);
    return ticket || null;
  },

  /**
   * Send a ticket to OPS system (mock)
   */
  async sendTicketToOps(ticket: Ticket): Promise<ApiResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    return mockSendToOps(ticket);
  },

  /**
   * Query ticket status from OPS system (mock)
   */
  async queryTicketStatus(id: string): Promise<ApiResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 900));
    return mockQueryTicketStatus(id);
  },
};

