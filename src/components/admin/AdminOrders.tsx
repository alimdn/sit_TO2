'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface Order {
  id: string
  userId: string
  status: string
  progress: number
  milestones: string
  notes: string | null
  createdAt: string
  user: { name: string; email: string }
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selected, setSelected] = useState<Order | null>(null)
  const [statusUpdate, setStatusUpdate] = useState('')

  const fetchOrders = () => {
    fetch('/api/orders')
      .then(r => r.json())
      .then(setOrders)
      .catch(() => {})
  }

  useEffect(() => { fetchOrders() }, [])

  const handleStatusUpdate = async () => {
    if (!selected || !statusUpdate) return
    try {
      const res = await fetch(`/api/orders/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusUpdate }),
      })
      if (res.ok) {
        toast.success('Order status updated')
        setSelected(null)
        fetchOrders()
      }
    } catch {
      toast.error('Failed to update order')
    }
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-[#FFB800]/10 text-[#FFB800]',
    in_progress: 'bg-[#00D1FF]/10 text-[#00D1FF]',
    review: 'bg-[#768dad]/10 text-[#768dad]',
    completed: 'bg-[#10B981]/10 text-[#10B981]',
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#000f22]">Orders Management</h2>

      <Card className="shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">#{order.id.slice(-8)}</TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm font-medium">{order.user?.name || 'Unknown'}</div>
                      <div className="text-xs text-[#4F5B76]">{order.user?.email || ''}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[order.status] || 'bg-gray-100 text-gray-600'}>
                      {order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.progress}%</TableCell>
                  <TableCell className="text-[#4F5B76]">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => {
                      setSelected(order)
                      setStatusUpdate(order.status)
                    }}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-[#4F5B76]">No orders yet</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order #{selected?.id.slice(-8)}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[#4F5B76]">Customer:</span>
                  <p className="font-medium">{selected.user?.name}</p>
                </div>
                <div>
                  <span className="text-[#4F5B76]">Email:</span>
                  <p className="font-medium">{selected.user?.email}</p>
                </div>
                <div>
                  <span className="text-[#4F5B76]">Progress:</span>
                  <p className="font-medium">{selected.progress}%</p>
                </div>
                <div>
                  <span className="text-[#4F5B76]">Created:</span>
                  <p className="font-medium">{new Date(selected.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              {selected.notes && (
                <div className="p-3 bg-[#f7fafd] rounded-lg">
                  <span className="text-xs text-[#4F5B76]">Notes:</span>
                  <p className="text-sm mt-1">{selected.notes}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label>Update Status</Label>
                <Select value={statusUpdate} onValueChange={setStatusUpdate}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleStatusUpdate} className="w-full bg-[#000f22] hover:bg-[#0A2540] text-white">
                Update Status
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
