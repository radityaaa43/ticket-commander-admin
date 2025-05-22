
import { createContext, useState, useEffect, ReactNode } from "react";
import { ticketService } from "@/services";
import { Ticket, LogEntry, DashboardStats, ApiResponse } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { calculateStats } from "@/utils/ticketUtils";
import { createTicketActions } from "./ticketActions";

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

export const TicketContext = createContext<TicketContextType | undefined>(undefined);

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

  // Create ticket actions
  const ticketActions = createTicketActions(
    updateTicketStatus,
    addLogEntry,
    getTicket
  );

  const value = {
    tickets,
    logs,
    stats,
    isLoading,
    getTicket,
    getTicketLogs,
    sendTicketToOps: ticketActions.sendTicketToOps,
    queryTicketStatus: ticketActions.queryTicketStatus,
    updateTicketStatus,
    addLogEntry,
  };

  return (
    <TicketContext.Provider value={value}>{children}</TicketContext.Provider>
  );
};
