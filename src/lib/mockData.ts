import { Ticket, LogEntry, DashboardStats, ApiResponse, TicketStatus } from "./types";

// Generate random ID
const generateId = () => Math.random().toString(36).substring(2, 10);

// Generate random date within the last 30 days
const generateDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 30));
  return date.toISOString();
};

// Sample categories
const categories = [
  "Account Issue", 
  "Payment Problem", 
  "Technical Support", 
  "Feature Request", 
  "Billing Question"
];

// Sample customer names
const customerNames = [
  "Alex Johnson", 
  "Maria Garcia", 
  "Wei Zhang", 
  "Aisha Patel", 
  "John Smith",
  "Sarah Brown",
  "Mohammed Ali",
  "Emma Wilson",
  "Raj Kumar",
  "Sophia Rodriguez"
];

// Generate random ticket status
const generateStatus = (): Ticket['status'] => {
  const statuses: Ticket['status'][] = ['new', 'pending', 'sent', 'failed'];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

// Generate a random priority
const generatePriority = (): 'low' | 'medium' | 'high' => {
  const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
  return priorities[Math.floor(Math.random() * priorities.length)];
};

// Generate mock tickets
export const generateMockTickets = (count: number): Ticket[] => {
  return Array.from({ length: count }).map((_, index) => {
    const customer = customerNames[Math.floor(Math.random() * customerNames.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const status = generateStatus();
    
    return {
      id: `TKT-${1000 + index}`,
      subject: `${category} - ${customer}`,
      description: `This is a sample ticket description for ${category.toLowerCase()}. The customer needs assistance with their issue.`,
      status,
      createdAt: generateDate(),
      customer: {
        name: customer,
        email: `${customer.toLowerCase().replace(' ', '.')}@example.com`,
        phone: `+62${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
      },
      priority: generatePriority(),
      category,
      metadata: {
        browser: Math.random() > 0.5 ? "Chrome" : "Firefox",
        os: Math.random() > 0.5 ? "Windows" : "MacOS",
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      },
    };
  });
};

// Generate mock logs
export const generateMockLogs = (tickets: Ticket[]): LogEntry[] => {
  const logs: LogEntry[] = [];
  
  tickets.forEach(ticket => {
    if (ticket.status === 'sent' || ticket.status === 'failed') {
      const isSuccess = ticket.status === 'sent';
      
      logs.push({
        id: generateId(),
        ticketId: ticket.id,
        action: 'send',
        status: isSuccess ? 'success' : 'failed',
        timestamp: new Date(new Date(ticket.createdAt).getTime() + 3600000).toISOString(),
        response: {
          success: isSuccess,
          message: isSuccess ? 'Ticket successfully sent to OPS system' : 'Failed to send ticket to OPS system',
          data: isSuccess ? { reference: generateId(), queue: 'priority' } : { error: 'Connection timeout' },
          timestamp: new Date().toISOString(),
        },
      });
      
      // Add retry attempts for failed tickets
      if (ticket.status === 'failed') {
        for (let i = 0; i < Math.floor(Math.random() * 2) + 1; i++) {
          logs.push({
            id: generateId(),
            ticketId: ticket.id,
            action: 'retry',
            status: 'failed',
            timestamp: new Date(new Date(ticket.createdAt).getTime() + (3600000 * (i + 2))).toISOString(),
            response: {
              success: false,
              message: 'Failed to send ticket to OPS system',
              data: { error: 'API server returned error code 503' },
              timestamp: new Date().toISOString(),
            },
          });
        }
      }
    }
  });
  
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Calculate dashboard statistics
export const calculateDashboardStats = (tickets: Ticket[]): DashboardStats => {
  const stats: DashboardStats = {
    total: tickets.length,
    new: 0,
    pending: 0,
    sent: 0,
    failed: 0,
  };
  
  tickets.forEach(ticket => {
    stats[ticket.status]++;
  });
  
  return stats;
};

// Mock function to simulate sending a ticket to OPS system
export const mockSendToOps = async (ticket: Ticket): Promise<ApiResponse> => {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // For demo purposes, randomly succeed or fail (with 80% success rate)
  const isSuccess = Math.random() < 0.8;
  
  const response: ApiResponse = {
    success: isSuccess,
    message: isSuccess 
      ? `Ticket ${ticket.id} successfully sent to OPS system` 
      : `Failed to send ticket ${ticket.id} to OPS system: Connection timeout`,
    data: isSuccess ? { ticketId: ticket.id, opsReference: `OPS-${Date.now()}` } : null,
    timestamp: new Date().toISOString(),
  };
  
  return response;
};

// Mock function to simulate querying a ticket status from OPS system
export const mockQueryTicketStatus = async (ticketId: string): Promise<ApiResponse> => {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // For demo purposes, randomly select one of the possible statuses for tickets that have been sent
  const possibleStatuses: TicketStatus[] = ["sent", "in_progress", "closed", "delayed"];
  const randomStatus = possibleStatuses[Math.floor(Math.random() * possibleStatuses.length)];
  
  // 90% success rate
  const isSuccess = Math.random() < 0.9;
  
  const response: ApiResponse = {
    success: isSuccess,
    message: isSuccess 
      ? `Successfully retrieved status for ticket ${ticketId}` 
      : `Failed to retrieve status for ticket ${ticketId}: Service unavailable`,
    data: isSuccess ? { 
      ticketId: ticketId, 
      status: randomStatus,
      lastUpdated: new Date().toISOString()
    } : null,
    timestamp: new Date().toISOString(),
  };
  
  return response;
};

// Default mock data export
const mockTickets = generateMockTickets(20);
const mockLogs = generateMockLogs(mockTickets);
const dashboardStats = calculateDashboardStats(mockTickets);

export const mockData = {
  tickets: mockTickets,
  logs: mockLogs,
  stats: dashboardStats,
  sendToOps: mockSendToOps,
  queryTicketStatus: mockQueryTicketStatus,
};

export default mockData;
