
import { Ticket, DashboardStats } from "@/lib/types";

/**
 * Calculate dashboard stats from tickets
 */
export const calculateStats = (ticketList: Ticket[]): DashboardStats => {
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
