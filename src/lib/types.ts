export type TicketStatus = 'new' | 'pending' | 'sent' | 'in_progress' | 'closed' | 'delayed' | 'failed';

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  createdAt: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  metadata?: Record<string, any>;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  timestamp: string;
}

export interface LogEntry {
  id: string;
  ticketId: string;
  action: 'send' | 'retry';
  status: 'success' | 'failed';
  timestamp: string;
  response: ApiResponse;
}

export interface DashboardStats {
  total: number;
  new: number;
  pending: number;
  sent: number;
  in_progress: number;
  closed: number;
  delayed: number;
  failed: number;
}
