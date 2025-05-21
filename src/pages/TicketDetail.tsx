
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTickets } from "@/context/TicketContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Send, 
  ArrowLeft, 
  AlertTriangle, 
  Check, 
  RefreshCw 
} from "lucide-react";
import { LogEntry } from "@/lib/types";
import { Separator } from "@/components/ui/separator";

const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    new: "bg-ticket-new text-white",
    pending: "bg-ticket-pending text-white animate-pulse-slow",
    sent: "bg-ticket-sent text-white",
    failed: "bg-ticket-failed text-white",
  };
  
  const statuses = {
    new: "New",
    pending: "Pending",
    sent: "Sent to OPS",
    failed: "Failed",
  };

  return (
    <Badge className={variants[status as keyof typeof variants]}>
      {statuses[status as keyof typeof statuses]}
    </Badge>
  );
};

const LogItem = ({ log }: { log: LogEntry }) => {
  const isSuccess = log.status === "success";
  const timestamp = new Date(log.timestamp).toLocaleString();
  
  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          {isSuccess ? (
            <div className="bg-green-100 p-1.5 rounded-full mr-2">
              <Check className="h-4 w-4 text-green-600" />
            </div>
          ) : (
            <div className="bg-red-100 p-1.5 rounded-full mr-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
          )}
          <span className="font-semibold">
            {log.action === "send" ? "Send to OPS" : "Retry Attempt"}
          </span>
        </div>
        <span className="text-sm text-muted-foreground">{timestamp}</span>
      </div>
      
      <div className="mt-2">
        <div className="text-sm mb-2">
          <strong>Status:</strong>{" "}
          {isSuccess ? (
            <span className="text-green-600">Success</span>
          ) : (
            <span className="text-red-600">Failed</span>
          )}
        </div>
        <div className="text-sm mb-2">
          <strong>Message:</strong> {log.response.message}
        </div>
        {log.response.data && (
          <div className="mt-2">
            <strong className="text-sm">Response Data:</strong>
            <pre className="bg-gray-50 p-2 rounded text-xs mt-1 overflow-x-auto">
              {JSON.stringify(log.response.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

const TicketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTicket, getTicketLogs, sendTicketToOps, isLoading } = useTickets();
  const [sending, setSending] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  
  const ticket = getTicket(id || "");
  const logs = getTicketLogs(id || "");
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Skeleton className="h-8 w-60" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-2xl font-semibold mb-2">Ticket Not Found</h2>
        <p className="text-muted-foreground mb-4">The ticket you're looking for doesn't exist.</p>
        <Button onClick={() => navigate("/tickets")}>
          Back to Ticket List
        </Button>
      </div>
    );
  }
  
  const handleSendToOps = async () => {
    try {
      setSending(true);
      await sendTicketToOps(ticket);
    } finally {
      setSending(false);
      setPreviewOpen(false);
    }
  };
  
  // Prepare payload preview (this is what would be sent to OPS)
  const payloadPreview = {
    ticket_id: ticket.id,
    subject: ticket.subject,
    description: ticket.description,
    customer_info: {
      name: ticket.customer.name,
      email: ticket.customer.email,
      phone: ticket.customer.phone || "N/A"
    },
    priority: ticket.priority,
    category: ticket.category,
    created_at: ticket.createdAt,
    metadata: ticket.metadata || {}
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/tickets")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tickets
          </Button>
        </div>
        <StatusBadge status={ticket.status} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{ticket.subject}</CardTitle>
                <CardDescription>Ticket {ticket.id}</CardDescription>
              </div>
              {ticket.status !== "sent" && (
                <AlertDialog open={previewOpen} onOpenChange={setPreviewOpen}>
                  <AlertDialogTrigger asChild>
                    <Button 
                      disabled={sending || ticket.status === "pending"}
                      className="flex items-center"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send to OPS
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Send Ticket to OPS</AlertDialogTitle>
                      <AlertDialogDescription>
                        You are about to send this ticket to the OPS system. Please review the data below.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="bg-gray-50 p-3 rounded">
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(payloadPreview, null, 2)}
                      </pre>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleSendToOps}
                        disabled={sending}
                      >
                        {sending && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm Send
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              
              {ticket.status === "failed" && logs.length > 0 && (
                <Button 
                  variant="outline"
                  onClick={handleSendToOps}
                  disabled={sending}
                  className="ml-2"
                >
                  {sending ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Retry
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="details">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Ticket Details</TabsTrigger>
                <TabsTrigger value="activity">Activity Log</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {ticket.description}
                  </p>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Ticket Info</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-muted-foreground">Category:</span>
                        <span className="ml-2 font-medium">{ticket.category}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Priority:</span>
                        <span className="ml-2 font-medium capitalize">{ticket.priority}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <span className="ml-2 font-medium">
                          {new Date(ticket.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Customer Info</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-muted-foreground">Name:</span>
                        <span className="ml-2 font-medium">{ticket.customer.name}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <span className="ml-2 font-medium">{ticket.customer.email}</span>
                      </div>
                      {ticket.customer.phone && (
                        <div>
                          <span className="text-muted-foreground">Phone:</span>
                          <span className="ml-2 font-medium">{ticket.customer.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {ticket.metadata && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Additional Data</h3>
                      <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto">
                        {JSON.stringify(ticket.metadata, null, 2)}
                      </pre>
                    </div>
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="activity">
                {logs.length > 0 ? (
                  <div className="space-y-4">
                    {logs.map((log) => (
                      <LogItem key={log.id} log={log} />
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>No activity found</AlertTitle>
                    <AlertDescription>
                      This ticket hasn't been sent to the OPS system yet.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-between">
            <div className="text-sm text-muted-foreground">
              Ticket ID: {ticket.id}
            </div>
            {ticket.status === "sent" && (
              <Badge variant="outline" className="bg-green-50">
                Successfully sent to OPS
              </Badge>
            )}
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Status History</CardTitle>
            <CardDescription>
              Recent activity for this ticket
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length > 0 ? (
              <div className="relative">
                <div className="absolute top-0 bottom-0 left-3 border-l-2 border-gray-200" />
                {logs.map((log, index) => (
                  <div key={log.id} className="mb-4 flex">
                    <div className={`z-10 h-6 w-6 rounded-full flex items-center justify-center ${
                      log.status === "success" ? "bg-green-500" : "bg-red-500"
                    }`}>
                      {log.status === "success" ? (
                        <Check className="h-3 w-3 text-white" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium">
                        {log.action === "send" ? "Sent to OPS" : "Retry attempt"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No activity yet
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            {ticket.status === "new" && (
              <div className="text-sm text-muted-foreground text-center">
                This ticket has not been sent to OPS yet.
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default TicketDetail;
