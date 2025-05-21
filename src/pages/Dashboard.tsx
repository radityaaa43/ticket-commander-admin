
import { useTickets } from "@/context/TicketContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Info, Send, AlertTriangle, Check } from "lucide-react";
import { Link } from "react-router-dom";

const StatusCard = ({ 
  title, 
  value, 
  icon, 
  description, 
  color,
  loading
}: { 
  title: string; 
  value: number; 
  icon: React.ReactNode; 
  description: string;
  color: string;
  loading: boolean;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <div className={`p-2 rounded-full ${color}`}>
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      {loading ? (
        <Skeleton className="h-8 w-20" />
      ) : (
        <div className="text-3xl font-bold">{value}</div>
      )}
      <p className="text-xs text-muted-foreground pt-1">{description}</p>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { tickets, logs, stats, isLoading } = useTickets();

  // Get recent logs (last 5)
  const recentLogs = logs.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of ticket status and operations
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatusCard 
          title="Total Tickets" 
          value={stats.total} 
          icon={<Info className="h-4 w-4 text-white" />}
          description="All tickets in system" 
          color="bg-blue-500"
          loading={isLoading}
        />
        <StatusCard 
          title="New" 
          value={stats.new} 
          icon={<Info className="h-4 w-4 text-white" />}
          description="Tickets awaiting processing" 
          color="bg-ticket-new"
          loading={isLoading}
        />
        <StatusCard 
          title="Sent to OPS" 
          value={stats.sent} 
          icon={<Check className="h-4 w-4 text-white" />}
          description="Successfully delivered" 
          color="bg-ticket-sent"
          loading={isLoading}
        />
        <StatusCard 
          title="Failed" 
          value={stats.failed} 
          icon={<AlertTriangle className="h-4 w-4 text-white" />}
          description="Failed delivery attempts" 
          color="bg-ticket-failed"
          loading={isLoading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentLogs.length > 0 ? (
              <div className="space-y-2">
                {recentLogs.map(log => {
                  const ticket = tickets.find(t => t.id === log.ticketId);
                  if (!ticket) return null;

                  return (
                    <Link 
                      key={log.id} 
                      to={`/tickets/${log.ticketId}`}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-accent group"
                    >
                      <div className={`p-2 rounded-full ${log.status === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {log.status === 'success' ? (
                          <Send className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="font-medium truncate">{ticket.subject}</p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {log.action === 'send' ? 'Sent to OPS' : 'Retry attempt'}: {log.status === 'success' ? 'Success' : 'Failed'}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No recent activity
              </div>
            )}

            <div className="mt-4 text-center">
              <Link to="/logs" className="text-sm text-primary hover:underline">
                View all logs
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Ticket Status</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">New</span>
                  <div className="w-2/3 bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-ticket-new h-2.5 rounded-full" 
                      style={{ width: `${(stats.new / stats.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{stats.new}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Pending</span>
                  <div className="w-2/3 bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-ticket-pending h-2.5 rounded-full" 
                      style={{ width: `${(stats.pending / stats.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{stats.pending}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Sent</span>
                  <div className="w-2/3 bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-ticket-sent h-2.5 rounded-full" 
                      style={{ width: `${(stats.sent / stats.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{stats.sent}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Failed</span>
                  <div className="w-2/3 bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-ticket-failed h-2.5 rounded-full" 
                      style={{ width: `${(stats.failed / stats.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{stats.failed}</span>
                </div>
              </div>
            )}

            <div className="mt-8 text-center">
              <Link to="/tickets" className="text-sm text-primary hover:underline">
                View all tickets
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
