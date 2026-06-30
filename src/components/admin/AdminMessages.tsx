'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RefreshCw, Trash2, Mail, MailOpen } from 'lucide-react'
import { toast } from 'sonner'

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  category: string
  message: string
  isRead: boolean
  createdAt: string
}

interface SupportTicket {
  id: string
  subject: string
  category: string
  status: string
  priority: string
  createdAt: string
  user: { name: string; email: string }
  messages: { id: string; content: string; senderId: string; sender: { name: string }; createdAt: string }[]
}

export default function AdminMessages() {
  const [contacts, setContacts] = useState<ContactMessage[]>([])
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchContacts = useCallback(() => {
    fetch('/api/contact', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setContacts(data)
      })
      .catch((e) => console.error('[AdminMessages] fetch error:', e))
  }, [])

  const fetchTickets = useCallback(() => {
    fetch('/api/support', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setTickets(data)
      })
      .catch((e) => console.error('[AdminMessages] fetch error:', e))
  }, [])

  useEffect(() => {
    fetchContacts()
    fetchTickets()
  }, [fetchContacts, fetchTickets])

  // Auto-refresh every 8 seconds so new messages from the public Contact Us
  // page show up in the admin panel without manual reload.
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      fetchContacts()
      fetchTickets()
    }, 8000)
    return () => clearInterval(interval)
  }, [autoRefresh, fetchContacts, fetchTickets])

  const handleManualRefresh = async () => {
    setRefreshing(true)
    fetchContacts()
    fetchTickets()
    setTimeout(() => setRefreshing(false), 600)
  }

  const markAsRead = async (id: string) => {
    await fetch(`/api/contact/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'read' }),
    })
    fetchContacts()
    toast.success('Marked as read')
  }

  const deleteContact = async (id: string) => {
    if (!confirm('Delete this message? This cannot be undone.')) return
    await fetch(`/api/contact/${id}`, { method: 'DELETE' })
    fetchContacts()
    if (selectedContact?.id === id) setSelectedContact(null)
    toast.success('Message deleted')
  }

  const updateTicketStatus = async (id: string, status: string) => {
    await fetch(`/api/support/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchTickets()
    toast.success('Ticket status updated')
  }

  const statusColors: Record<string, string> = {
    open: 'bg-[#416853]/10 text-[#416853]',
    in_progress: 'bg-[#FFB800]/10 text-[#FFB800]',
    resolved: 'bg-[#29503c]/10 text-[#29503c]',
    closed: 'bg-[#717973]/10 text-[#717973]',
  }

  const unreadCount = contacts.filter(c => !c.isRead).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#29503c] flex items-center gap-2">
            Messages
            {unreadCount > 0 && (
              <Badge className="bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
                {unreadCount} unread
              </Badge>
            )}
          </h2>
          <p className="text-xs text-[#414843] mt-1">
            Auto-refreshing every 8 seconds — new messages appear automatically.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`h-9 border-[#c1c8c1] ${autoRefresh ? 'text-[#29503c]' : 'text-[#717973]'}`}
          >
            {autoRefresh ? 'Auto: ON' : 'Auto: OFF'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="h-9 border-[#c1c8c1] hover:bg-[#faf9f6]"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="contact">
        <TabsList className="bg-[#eeeeea]">
          <TabsTrigger value="contact">Contact Messages ({contacts.length})</TabsTrigger>
          <TabsTrigger value="support">Support Tickets ({tickets.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="contact" className="mt-4">
          <Card className="shadow-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">{c.name}</div>
                          <div className="text-xs text-[#414843]">{c.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{c.subject}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-xs capitalize">{c.category}</Badge></TableCell>
                      <TableCell>
                        <Badge className={c.isRead ? 'bg-[#29503c]/10 text-[#29503c]' : 'bg-[#FFB800]/10 text-[#FFB800]'}>
                          {c.isRead ? 'Read' : 'Unread'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-[#414843]">{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedContact(c)}
                            className="h-8 px-2"
                            title="View message"
                          >
                            View
                          </Button>
                          {!c.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(c.id)}
                              className="h-8 px-2 text-[#29503c] hover:bg-[#29503c]/10"
                              title="Mark as read"
                            >
                              <MailOpen className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteContact(c.id)}
                            className="h-8 px-2 text-[#ba1a1a] hover:bg-[#ba1a1a]/10"
                            title="Delete message"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {contacts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-[#414843]">No contact messages</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="mt-4">
          <Card className="shadow-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">{t.user?.name || 'Unknown'}</div>
                          <div className="text-xs text-[#414843]">{t.user?.email || ''}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{t.subject}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[t.status] || 'bg-gray-100 text-gray-600'}>
                          {t.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize text-sm">{t.priority}</TableCell>
                      <TableCell className="text-xs text-[#414843]">{new Date(t.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(t)}>View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contact message detail */}
      <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedContact?.subject}</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-[#414843]">From:</span> <span className="font-medium">{selectedContact.name}</span></div>
                <div><span className="text-[#414843]">Email:</span> <span className="font-medium">{selectedContact.email}</span></div>
                <div><span className="text-[#414843]">Category:</span> <span className="font-medium capitalize">{selectedContact.category}</span></div>
                <div><span className="text-[#414843]">Date:</span> <span className="font-medium">{new Date(selectedContact.createdAt).toLocaleString()}</span></div>
              </div>
              <div className="p-4 bg-[#faf9f6] rounded-xl">
                <p className="text-sm text-[#29503c] whitespace-pre-wrap">{selectedContact.message}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Ticket detail */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedTicket?.subject}</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-2">
                <Badge className={statusColors[selectedTicket.status]}>
                  {selectedTicket.status.replace('_', ' ')}
                </Badge>
                <Badge variant="outline" className="capitalize">{selectedTicket.priority}</Badge>
              </div>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {selectedTicket.messages?.map((msg) => (
                    <div key={msg.id} className="p-3 bg-[#faf9f6] rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{msg.sender?.name || 'Unknown'}</span>
                        <span className="text-xs text-[#717973]">{new Date(msg.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-[#29503c] whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')} className="bg-[#29503c] hover:bg-[#284e3b] text-white">Resolve</Button>
                <Button size="sm" variant="outline" onClick={() => updateTicketStatus(selectedTicket.id, 'closed')} className="border-[#c1c8c1]">Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
