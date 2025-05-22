
import { useTickets } from "@/context/TicketContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Info, Send, AlertTriangle, Check, Clock, Hourglass, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";

// Status card component for displaying individual status metrics
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

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'new':
        return 'bg-ticket-new text-white';
      case 'pending':
        return 'bg-ticket-pending text-white';
      case 'sent':
        return 'bg-ticket-sent text-white';
      case 'in_progress':
        return 'bg-blue-500 text-white';
      case 'closed':
        return 'bg-gray-500 text-white';
      case 'delayed':
        return 'bg-amber-500 text-white';
      case 'failed':
        return 'bg-ticket-failed text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <Badge className={`${getStatusStyles()}`}>
      {status.replace('_', ' ')}
    </Badge>
  );
};

const Dashboard = () => {
  const { tickets, logs, stats, isLoading } = useTickets();

  // Get recent logs (last 5)
  const recentLogs = logs.slice(0, 5);

  // Prepare pie chart data
  const pieChartData = [
    { name: 'New', value: stats.new, color: 'var(--ticket-new)' },
    { name: 'Pending', value: stats.pending, color: 'var(--ticket-pending)' },
    { name: 'Sent', value: stats.sent, color: 'var(--ticket-sent)' },
    { name: 'In Progress', value: stats.in_progress, color: '#3b82f6' }, // blue-500
    { name: 'Closed', value: stats.closed, color: '#6b7280' }, // gray-500
    { name: 'Delayed', value: stats.delayed, color: '#f59e0b' }, // amber-500
    { name: 'Failed', value: stats.failed, color: 'var(--ticket-failed)' }
  ].filter(item => item.value > 0); // Only show statuses with tickets

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
          icon={<Send className="h-4 w-4 text-white" />}
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

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center">
            {isLoading ? (
              <Skeleton className="h-[200px] w-[200px] rounded-full" />
            ) : stats.total > 0 ? (
              <ChartContainer className="h-[250px]" config={{}}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip 
                      content={
                        <ChartTooltipContent 
                          formatter={(value, name) => [`${value} tickets`, name]}
                        />
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                No tickets available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>All Statuses</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array(7).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-ticket-new" />
                        <span className="text-sm font-medium">New</span>
                      </span>
                      <span className="font-medium">{stats.new}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <Hourglass className="h-4 w-4 text-ticket-pending" />
                        <span className="text-sm font-medium">Pending</span>
                      </span>
                      <span className="font-medium">{stats.pending}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <Send className="h-4 w-4 text-ticket-sent" />
                        <span className="text-sm font-medium">Sent</span>
                      </span>
                      <span className="font-medium">{stats.sent}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-ticket-failed" />
                        <span className="text-sm font-medium">Failed</span>
                      </span>
                      <span className="font-medium">{stats.failed}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">In Progress</span>
                      </span>
                      <span className="font-medium">{stats.in_progress}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">Closed</span>
                      </span>
                      <span className="font-medium">{stats.closed}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium">Delayed</span>
                  </span>
                  <span className="font-medium">{stats.delayed}</span>
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
      
      <div className="grid gap-4 md:grid-cols-1">
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
                          <div className="flex items-center gap-2">
                            <StatusBadge status={ticket.status} />
                            <span className="text-xs text-muted-foreground">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {log.action === 'send' 
                            ? 'Sent to OPS' 
                            : log.action === 'query' 
                              ? 'Status query'
                              : 'Retry attempt'}: {log.status === 'success' ? 'Success' : 'Failed'}
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
      </div>
    </div>
  );
};

export default Dashboard;
