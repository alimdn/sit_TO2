'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

interface Order {
  id: string
  status: string
  progress: number
  milestones: string
  notes: string | null
  createdAt: string
  updatedAt: string
  planId: string | null
}

interface Payment {
  id: string
  amount: number
  currency: string
  status: string
  method: string
  transactionId: string | null
  createdAt: string
}

export default function OrdersPage() {
  const { user } = useAppStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      fetch('/api/orders?userId=' + user.id).then(r => r.json()),
      fetch('/api/subscriptions?userId=' + user.id).then(r => r.json()),
    ]).then(([ords, subs]) => {
      setOrders(ords)
      // Get payments from subscriptions
      const allPayments: Payment[] = []
      subs.forEach((sub: any) => {
        if (sub.payments) {
          allPayments.push(...sub.payments)
        }
      })
      setPayments(allPayments)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user])

  const statusColors: Record<string, string> = {
    active: 'bg-[#10B981]/10 text-[#10B981]',
    pending: 'bg-[#FFB800]/10 text-[#FFB800]',
    in_progress: 'bg-[#00D1FF]/10 text-[#00D1FF]',
    completed: 'bg-[#10B981]/10 text-[#10B981]',
    review: 'bg-[#768dad]/10 text-[#768dad]',
    completed: 'bg-[#10B981]/10 text-[#10B981]',
    failed: 'bg-[#ba1a1a]/10 text-[#ba1a1a]',
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2].map(i => (
          <div key={i} className="h-40 rounded-xl bg-[#f1f4f7] animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#000f22]">My Orders</h2>

      {orders.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <p className="text-[#4F5B76]">No orders yet. Subscribe to a plan to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const milestones = JSON.parse(order.milestones || '[]')
            return (
              <Card key={order.id} className="shadow-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Order #{order.id.slice(-8)}</CardTitle>
                    <Badge className={statusColors[order.status] || 'bg-gray-100 text-gray-600'}>
                      {order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#4F5B76]">
                    Created {new Date(order.createdAt).toLocaleDateString()} • Progress: {order.progress}%
                  </p>
                </CardHeader>
                <CardContent>
                  {order.notes && (
                    <p className="text-sm text-[#4F5B76] mb-4 p-3 bg-[#f7fafd] rounded-lg">{order.notes}</p>
                  )}

                  {/* Milestones timeline */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-[#000f22]">Milestones</h4>
                    <div className="space-y-2">
                      {milestones.map((ms: any, i: number) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                            ms.status === 'completed' ? 'bg-[#10B981]' :
                            ms.status === 'in_progress' ? 'bg-[#00D1FF]' :
                            'bg-[#e5e8eb]'
                          }`} />
                          <span className={`text-sm ${
                            ms.status === 'pending' ? 'text-[#74777e]' : 'text-[#000f22]'
                          }`}>
                            {ms.name}
                          </span>
                          {ms.date && (
                            <span className="text-xs text-[#74777e] ml-auto">{ms.date}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Payment history */}
      {payments.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-xs">
                      {payment.transactionId || payment.id.slice(-8)}
                    </TableCell>
                    <TableCell className="font-medium">
                      ${payment.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="capitalize">{payment.method}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[payment.status] || 'bg-gray-100 text-gray-600'} variant="secondary">
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#4F5B76]">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
