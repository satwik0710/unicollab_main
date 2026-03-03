import { useState, useEffect } from "react"
import { Clock, CheckCircle2, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import api from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface PendingRequest {
    id: string
    created_at: string
    status: string
    message?: string
    project: {
        id: string
        title: string
        domain: string
        status: string
    }
    sender?: {
        id: string
        full_name: string
        avatar_url?: string
        domain?: string
    }
}

export function PendingRequests() {
    const [sentRequests, setSentRequests] = useState<PendingRequest[]>([])
    const [receivedRequests, setReceivedRequests] = useState<PendingRequest[]>([])
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        setLoading(true)
        try {
            const [sentRes, receivedRes] = await Promise.all([
                api.get("/requests/sent"),
                api.get("/requests/received")
            ])

            setSentRequests(sentRes.data.filter((req: PendingRequest) => req.status === "pending"))
            setReceivedRequests(receivedRes.data.filter((req: PendingRequest) => req.status === "pending"))
        } catch (error) {
            console.error("Failed to fetch pending requests", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (requestId: string, action: 'accept' | 'reject') => {
        try {
            await api.post(`/requests/${requestId}/${action}`)
            toast({
                title: action === 'accept' ? "Request Accepted" : "Request Rejected",
                description: action === 'accept' ? "They have been added to your team." : "The request was declined.",
            })
            // Refresh to remove from pending
            fetchRequests()
        } catch (error) {
            toast({
                title: "Action Failed",
                description: "There was a problem processing this request.",
                variant: "destructive",
            })
        }
    }

    if (loading) {
        return (
            <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="text-xl font-bold text-card-foreground">Pending Requests</h2>
                <div className="mt-4 flex h-32 items-center justify-center">
                    <p className="text-muted-foreground animate-pulse">Loading requests...</p>
                </div>
            </div>
        )
    }

    const totalPending = sentRequests.length + receivedRequests.length

    return (
        <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-card-foreground">Pending Requests</h2>
                {totalPending > 0 && (
                    <Badge variant="outline" className="font-normal text-muted-foreground">
                        {totalPending} Action{totalPending !== 1 && "s"} Needed
                    </Badge>
                )}
            </div>

            <Tabs defaultValue="received" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4 bg-secondary">
                    <TabsTrigger value="received">
                        Received ({receivedRequests.length})
                    </TabsTrigger>
                    <TabsTrigger value="sent">
                        Sent ({sentRequests.length})
                    </TabsTrigger>
                </TabsList>

                {/* RECEIVED REQUESTS */}
                <TabsContent value="received" className="space-y-4">
                    {receivedRequests.length === 0 ? (
                        <EmptyState message="No pending collaboration requests for your projects." />
                    ) : (
                        receivedRequests.map((request) => (
                            <div
                                key={request.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-secondary/30 p-4 transition-colors hover:bg-secondary/60"
                            >
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-10 w-10 border border-border">
                                        <AvatarImage src={request.sender?.avatar_url} />
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            {request.sender?.full_name?.charAt(0) || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-card-foreground">
                                                {request.sender?.full_name || "Unknown User"}
                                            </span>
                                            <span className="text-xs text-muted-foreground">applied to</span>
                                            <Link to={`/projects/${request.project.id}`} className="font-medium text-primary hover:underline">
                                                {request.project.title}
                                            </Link>
                                        </div>
                                        {request.message && (
                                            <p className="mt-2 text-sm text-muted-foreground italic border-l-2 pl-2 border-border">
                                                "{request.message}"
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-xs text-muted-foreground">
                                                {request.sender?.domain || "Unknown Domain"}
                                            </span>
                                            <span className="text-xs text-muted-foreground">•</span>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(request.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 self-start sm:self-center">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 border-green-500/50 text-green-500 hover:bg-green-500/10 hover:text-green-600"
                                        onClick={() => handleAction(request.id, 'accept')}
                                    >
                                        <CheckCircle2 className="mr-1 size-4" />
                                        Accept
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => handleAction(request.id, 'reject')}
                                    >
                                        <XCircle className="mr-1 size-4" />
                                        Reject
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </TabsContent>

                {/* SENT REQUESTS */}
                <TabsContent value="sent" className="space-y-4">
                    {sentRequests.length === 0 ? (
                        <EmptyState message="You haven't applied to any projects yet." />
                    ) : (
                        sentRequests.map((request) => (
                            <div
                                key={request.id}
                                className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-4 transition-colors hover:bg-secondary/60"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 rounded-full bg-accent/20 p-2 text-accent">
                                        <Clock className="size-4" />
                                    </div>
                                    <div>
                                        <Link to={`/projects/${request.project.id}`} className="font-medium text-card-foreground hover:underline">
                                            {request.project.title}
                                        </Link>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-muted-foreground">Applied {new Date(request.created_at).toLocaleDateString()}</span>
                                            <span className="text-xs text-muted-foreground">•</span>
                                            <span className="text-xs text-muted-foreground">{request.project.domain}</span>
                                        </div>
                                        {request.message && (
                                            <p className="mt-2 text-xs text-muted-foreground line-clamp-1">
                                                Message: {request.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <Badge variant="outline" className="text-xs text-yellow-500 border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/10">
                                    PENDING
                                </Badge>
                            </div>
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/50">
            <Clock className="mb-2 size-6 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">No pending requests</p>
            <p className="text-xs text-muted-foreground mt-1 text-center max-w-[250px]">
                {message}
            </p>
        </div>
    )
}
