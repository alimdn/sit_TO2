'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
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

  const fetchContacts = () => {
    fetch('/api/contact')
      .then(r => r.json())
      .then(setContacts)
      .catch(() => {})
  }

  const fetchTickets = () => {
    fetch('/api/support')
      .then(r => r.json())
      .then(setTickets)
      .catch(() => {})
  }

  useEffect(() => {
    fetchContacts()
    fetchTickets()
  }, [])

  const markAsRead = async (id: string) => {
    await fetch(`/api/contact/${id}`, { method: 'PUT' })
    fetchContacts()
    toast.success('Marked as read')
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
    open: 'bg-[#00D1FF]/10 text-[#00D1FF]',
    in_progress: 'bg-[#FFB800]/10 text-[#FFB800]',
    resolved: 'bg-[#10B981]/10 text-[#10B981]',
    closed: 'bg-[#74777e]/10 text-[#74777e]',
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#000f22]">Messages</h2>

      <Tabs defaultValue="contact">
        <TabsList className="bg-[#f1f4f7]">
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
                          <div className="text-xs text-[#4F5B76]">{c.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{c.subject}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-xs capitalize">{c.category}</Badge></TableCell>
                      <TableCell>
                        <Badge className={c.isRead ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#FFB800]/10 text-[#FFB800]'}>
                          {c.isRead ? 'Read' : 'Unread'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-[#4F5B76]">{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedContact(c)}>View</Button>
                          {!c.isRead && (
                            <Button variant="ghost" size="sm" onClick={() => markAsRead(c.id)}>Read</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {contacts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-[#4F5B76]">No contact messages</TableCell>
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
                          <div className="text-xs text-[#4F5B76]">{t.user?.email || ''}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{t.subject}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[t.status] || 'bg-gray-100 text-gray-600'}>
                          {t.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize text-sm">{t.priority}</TableCell>
                      <TableCell className="text-xs text-[#4F5B76]">{new Date(t.createdAt).toLocaleDateString()}</TableCell>
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
                <div><span className="text-[#4F5B76]">From:</span> <span className="font-medium">{selectedContact.name}</span></div>
                <div><span className="text-[#4F5B76]">Email:</span> <span className="font-medium">{selectedContact.email}</span></div>
                <div><span className="text-[#4F5B76]">Category:</span> <span className="font-medium capitalize">{selectedContact.category}</span></div>
                <div><span className="text-[#4F5B76]">Date:</span> <span className="font-medium">{new Date(selectedContact.createdAt).toLocaleString()}</span></div>
              </div>
              <div className="p-4 bg-[#f7fafd] rounded-xl">
                <p className="text-sm text-[#000f22] whitespace-pre-wrap">{selectedContact.message}</p>
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
                    <div key={msg.id} className="p-3 bg-[#f7fafd] rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{msg.sender?.name || 'Unknown'}</span>
                        <span className="text-xs text-[#74777e]">{new Date(msg.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-[#000f22] whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')} className="bg-[#10B981] hover:bg-[#059669] text-white">Resolve</Button>
                <Button size="sm" variant="outline" onClick={() => updateTicketStatus(selectedTicket.id, 'closed')} className="border-[#e6ebf1]">Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
