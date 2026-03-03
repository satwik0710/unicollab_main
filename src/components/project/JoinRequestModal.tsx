import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import api from "@/lib/api"
import { toast } from "sonner"

interface JoinRequestModalProps {
    projectId: string
    isOpen: boolean
    onClose: () => void
}

export function JoinRequestModal({ projectId, isOpen, onClose }: JoinRequestModalProps) {
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!message.trim()) {
            toast.error("Please provide a message for the project founder.")
            return
        }

        setLoading(true)
        try {
            await api.post(`/requests/send`, {
                project_id: projectId,
                message: message.trim()
            })
            toast.success("Collaboration request sent successfully!")
            setMessage("")
            onClose()
        } catch (error: any) {
            console.error(error)
            toast.error(error.response?.data?.detail || "Failed to send request")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Request to Join</DialogTitle>
                    <DialogDescription>
                        Send a message to the project founder detailing why you'd be a great fit for this team.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Textarea
                        placeholder="Hi, I am interested in joining your project because..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="min-h-[120px] resize-none"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
                        {loading ? "Sending..." : "Send Request"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
