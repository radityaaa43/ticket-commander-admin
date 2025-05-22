import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ticketService } from "@/services";
import { Ticket, LogEntry, ApiResponse, DashboardStats } from "@/lib/types";
import { toast } from "@/hooks/use-toast";

interface TicketContextType {
  tickets: Ticket[];
  logs: LogEntry[];
  stats: DashboardStats;
  isLoading: boolean;
  getTicket: (id: string) => Ticket | undefined;
  getTicketLogs: (id: string) => LogEntry[];
  sendTicketToOps: (ticket: Ticket) => Promise<ApiResponse>;
  queryTicketStatus: (id: string) => Promise<ApiResponse>;
  updateTicketStatus: (id: string, status: Ticket["status"]) => void;
  addLogEntry: (log: Omit<LogEntry, "id">) => void;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const TicketProvider = ({ children }: { children: ReactNode }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    new: 0,
    pending: 0,
    sent: 0,
    in_progress: 0,
    closed: 0,
    delayed: 0,
    failed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch data from backend service
    const loadData = async () => {
      try {
        setIsLoading(true);
        const fetchedTickets = await ticketService.fetchAllTickets();
        setTickets(fetchedTickets);
        
        // In a real application, you'd also fetch logs from the backend
        // For now, we'll keep using mock logs
        // const fetchedLogs = await ticketService.fetchLogs();
        // setLogs(fetchedLogs);
        
        // Calculate stats from fetched tickets
        const calculatedStats = calculateStats(fetchedTickets);
        setStats(calculatedStats);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load ticket data",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate dashboard stats from tickets
  const calculateStats = (ticketList: Ticket[]): DashboardStats => {
    const stats: DashboardStats = {
      total: ticketList.length,
      new: 0,
      pending: 0,
      sent: 0,
      in_progress: 0,
      closed: 0,
      delayed: 0,
      failed: 0,
    };

    // Count tickets by status
    ticketList.forEach(ticket => {
      stats[ticket.status]++;
    });

    return stats;
  };

  const getTicket = (id: string) => {
    return tickets.find(ticket => ticket.id === id);
  };

  const getTicketLogs = (id: string) => {
    return logs.filter(log => log.ticketId === id);
  };

  const updateTicketStatus = (id: string, status: Ticket["status"]) => {
    setTickets(prevTickets =>
      prevTickets.map(ticket =>
        ticket.id === id ? { ...ticket, status } : ticket
      )
    );

    // Update stats
    setStats(prevStats => {
      const ticket = tickets.find(t => t.id === id);
      if (ticket && ticket.status !== status) {
        return {
          ...prevStats,
          [ticket.status]: prevStats[ticket.status] - 1,
          [status]: prevStats[status] + 1
        };
      }
      return prevStats;
    });
  };

  const addLogEntry = (logData: Omit<LogEntry, "id">) => {
    const newLog: LogEntry = {
      ...logData,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };

    setLogs(prevLogs => [newLog, ...prevLogs]);
  };

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

  // Query ticket status from backend
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

  const value = {
    tickets,
    logs,
    stats,
    isLoading,
    getTicket,
    getTicketLogs,
    sendTicketToOps,
    queryTicketStatus,
    updateTicketStatus,
    addLogEntry,
  };

  return (
    <TicketContext.Provider value={value}>{children}</TicketContext.Provider>
  );
};

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (context === undefined) {
    throw new Error("useTickets must be used within a TicketProvider");
  }
  return context;
};
