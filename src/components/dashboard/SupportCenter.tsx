'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'

interface Ticket {
  id: string
  subject: string
  category: string
  status: string
  priority: string
  createdAt: string
  messages: { id: string; content: string; senderId: string; isRead: boolean; createdAt: string }[]
}

export default function SupportCenter() {
  const { user } = useAppStore()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newTicket, setNewTicket] = useState({ subject: '', category: '', message: '' })

  const fetchTickets = () => {
    if (!user) return
    fetch('/api/support?userId=' + user.id)
      .then(r => r.json())
      .then(data => {
        setTickets(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchTickets()
  }, [user])

  const handleCreateTicket = async () => {
    if (!user || !newTicket.subject || !newTicket.category || !newTicket.message) {
      toast.error('Please fill in all fields')
      return
    }
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          subject: newTicket.subject,
          category: newTicket.category,
          message: newTicket.message,
        }),
      })
      if (res.ok) {
        toast.success('Ticket created successfully')
        setDialogOpen(false)
        setNewTicket({ subject: '', category: '', message: '' })
        fetchTickets()
      }
    } catch {
      toast.error('Failed to create ticket')
    }
  }

  const handleReply = async () => {
    if (!user || !selectedTicket || !replyText.trim()) return
    try {
      const res = await fetch(`/api/support/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: user.id, content: replyText }),
      })
      if (res.ok) {
        setReplyText('')
        // Refresh ticket
        const fresh = await fetch(`/api/support/${selectedTicket.id}`).then(r => r.json())
        setSelectedTicket(fresh)
        fetchTickets()
      }
    } catch {
      toast.error('Failed to send reply')
    }
  }

  const handleSelectTicket = async (ticket: Ticket) => {
    const fresh = await fetch(`/api/support/${ticket.id}`).then(r => r.json())
    setSelectedTicket(fresh)
  }

  const statusColors: Record<string, string> = {
    open: 'bg-[#416853]/10 text-[#416853]',
    in_progress: 'bg-[#FFB800]/10 text-[#FFB800]',
    resolved: 'bg-[#29503c]/10 text-[#29503c]',
    closed: 'bg-[#717973]/10 text-[#717973]',
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2].map(i => (
          <div key={i} className="h-40 rounded-xl bg-[#eeeeea] animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#29503c]">Support Center</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#29503c] hover:bg-[#284e3b] text-white h-9">
              <Plus className="h-4 w-4 mr-2" /> New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="What do you need help with?"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newTicket.category} onValueChange={(v) => setNewTicket({ ...newTicket, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="suggestion">Suggestion</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  placeholder="Describe your issue..."
                  rows={4}
                />
              </div>
              <Button onClick={handleCreateTicket} className="w-full bg-[#29503c] hover:bg-[#284e3b] text-white">
                Submit Ticket
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket list */}
        <div className="lg:col-span-1 space-y-3">
          {tickets.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="p-6 text-center">
                <MessageCircle className="h-8 w-8 text-[#c1c8c1] mx-auto mb-3" />
                <p className="text-sm text-[#414843]">No support tickets yet.</p>
              </CardContent>
            </Card>
          ) : (
            tickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => handleSelectTicket(ticket)}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  selectedTicket?.id === ticket.id
                    ? 'bg-[#29503c] text-white shadow-card-hover'
                    : 'bg-white shadow-card hover:shadow-card-hover'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${selectedTicket?.id === ticket.id ? 'text-white' : 'text-[#29503c]'}`}>
                    {ticket.subject}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${statusColors[ticket.status]}`}>
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                  <span className={`text-xs ${selectedTicket?.id === ticket.id ? 'text-[#717973]' : 'text-[#717973]'}`}>
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Ticket detail */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{selectedTicket.subject}</CardTitle>
                  <Badge className={statusColors[selectedTicket.status]}>
                    {selectedTicket.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {selectedTicket.messages.map((msg) => {
                    const isUser = msg.senderId === user?.id
                    return (
                      <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                          isUser
                            ? 'bg-[#29503c] text-white'
                            : 'bg-[#eeeeea] text-[#29503c]'
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <span className={`text-xs mt-1 block ${isUser ? 'text-[#717973]' : 'text-[#717973]'}`}>
                            {new Date(msg.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
                  <div className="flex gap-3 pt-4 border-t border-[#c1c8c1]">
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      rows={2}
                      className="resize-none"
                    />
                    <Button
                      onClick={handleReply}
                      disabled={!replyText.trim()}
                      className="bg-[#29503c] hover:bg-[#284e3b] text-white self-end"
                    >
                      Send
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-card">
              <CardContent className="p-12 text-center">
                <MessageCircle className="h-10 w-10 text-[#c1c8c1] mx-auto mb-3" />
                <p className="text-[#414843]">Select a ticket to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
