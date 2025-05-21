
import { useState } from "react";
import { useTickets } from "@/context/TicketContext";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  Send, 
  ArrowRight,
  Circle,
  Loader,
  Check,
  Clock,
  X
} from "lucide-react";
import { Link } from "react-router-dom";
import { Ticket } from "@/lib/types";

const StatusBadge = ({ status }: { status: Ticket["status"] }) => {
  const variants = {
    new: "bg-ticket-new text-white",
    pending: "bg-ticket-pending text-white animate-pulse-slow",
    sent: "bg-ticket-sent text-white",
    in_progress: "bg-primary text-primary-foreground",
    closed: "bg-green-600 text-white",
    delayed: "bg-amber-500 text-white",
    failed: "bg-ticket-failed text-white",
  };
  
  const labels = {
    new: "New",
    pending: "Pending",
    sent: "Sent to OPS",
    in_progress: "In Progress",
    closed: "Closed",
    delayed: "Delayed",
    failed: "Failed",
  };

  const statusIcons = {
    new: <Circle className="h-4 w-4 mr-1" />,
    pending: <Loader className="h-4 w-4 mr-1 animate-spin" />,
    sent: <Send className="h-4 w-4 mr-1" />,
    in_progress: <Loader className="h-4 w-4 mr-1" />,
    closed: <Check className="h-4 w-4 mr-1" />,
    delayed: <Clock className="h-4 w-4 mr-1" />,
    failed: <X className="h-4 w-4 mr-1" />,
  };

  return (
    <Badge className={`${variants[status]} flex items-center`}>
      {statusIcons[status]}
      {labels[status]}
    </Badge>
  );
};

const TicketList = () => {
  const { tickets, isLoading } = useTickets();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Filter tickets based on search query and status filter
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
        <p className="text-muted-foreground">
          View and manage all support tickets
        </p>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Tickets</CardTitle>
          <CardDescription>
            A list of all tickets in the system. Click on a ticket to view details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
            <div className="relative w-full md:w-1/3">
              <Input
                placeholder="Search tickets..."
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
                <SelectItem value="all">All Tickets</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sent">Sent to OPS</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
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
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.length > 0 ? (
                    filteredTickets.map(ticket => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">{ticket.id}</TableCell>
                        <TableCell>{ticket.subject}</TableCell>
                        <TableCell>{ticket.customer.name}</TableCell>
                        <TableCell>
                          <StatusBadge status={ticket.status} />
                        </TableCell>
                        <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              asChild
                            >
                              <Link to={`/tickets/${ticket.id}`}>
                                <ArrowRight className="h-4 w-4 mr-2" />
                                View
                              </Link>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Link 
                                    to={`/tickets/${ticket.id}`}
                                    className="flex w-full"
                                  >
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                {(ticket.status === "new" || ticket.status === "failed") && (
                                  <DropdownMenuItem>
                                    <Link 
                                      to={`/tickets/${ticket.id}`} 
                                      className="flex items-center w-full"
                                    >
                                      <Send className="mr-2 h-4 w-4" />
                                      Send to OPS
                                    </Link>
                                  </DropdownMenuItem>
                                )}
                                {(ticket.status === "sent" || ticket.status === "in_progress" || ticket.status === "delayed") && (
                                  <DropdownMenuItem>
                                    <Link 
                                      to={`/tickets/${ticket.id}`} 
                                      className="flex items-center w-full"
                                    >
                                      <Loader className="mr-2 h-4 w-4" />
                                      Query Status
                                    </Link>
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No tickets found
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

export default TicketList;
