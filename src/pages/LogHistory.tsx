
import { useState } from "react";
import { useTickets } from "@/context/TicketContext";
import { Link } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LogEntry } from "@/lib/types";
import { Check, AlertTriangle, RefreshCw, ArrowRight, Send } from "lucide-react";

const LogHistory = () => {
  const { logs, tickets, isLoading } = useTickets();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter logs based on search query and status filter
  const filteredLogs = logs.filter(log => {
    const ticket = tickets.find(t => t.id === log.ticketId);
    if (!ticket) return false;
    
    const matchesSearch = 
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
        <p className="text-muted-foreground">
          View all ticket activity and API communication logs
        </p>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>API Communication Logs</CardTitle>
          <CardDescription>
            History of all communication with the OPS system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
            <div className="relative w-full md:w-1/3">
              <Input
                placeholder="Search by ticket ID or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Logs</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {isLoading ? (
            <div className="space-y-2">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Timestamp</TableHead>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead className="text-right">View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map(log => {
                      const ticket = tickets.find(t => t.id === log.ticketId);
                      if (!ticket) return null;
                      
                      return (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">
                            {new Date(log.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{ticket.id}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {ticket.subject}
                            </div>
                          </TableCell>
                          <TableCell>
                            {log.action === "send" ? (
                              <div className="flex items-center">
                                <Send className="h-3 w-3 mr-1" />
                                <span>Send</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <RefreshCw className="h-3 w-3 mr-1" />
                                <span>Retry</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                log.status === "success"
                                  ? "bg-green-500 text-white"
                                  : "bg-red-500 text-white"
                              }
                            >
                              {log.status === "success" ? (
                                <div className="flex items-center">
                                  <Check className="h-3 w-3 mr-1" />
                                  Success
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Failed
                                </div>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {log.response.message}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              asChild
                            >
                              <Link to={`/tickets/${log.ticketId}`}>
                                <ArrowRight className="h-4 w-4 mr-1" /> 
                                Details
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No logs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LogHistory;
