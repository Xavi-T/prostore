'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { formatCurrency, formatDateTime, formatId } from '@/lib/utils'
import { Order } from '@/types'
import Image from 'next/image'
import Link from 'next/link'
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer
} from '@paypal/react-paypal-js'
import {
  approvePaypalOrder,
  createPaypalOrder,
  updateOrderToPaidCOD,
  deliverOrder
} from '@/lib/actions/order.action'
import { toast } from 'sonner'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'

function OrderDetailsTable({
  order,
  paypalClientId,
  isAdmin
}: {
  order: Omit<Order, 'paymentResult'>
  paypalClientId: string
  isAdmin: boolean
}) {
  const PrintLoadingState = () => {
    const [{ isPending, isRejected }] = usePayPalScriptReducer()
    let status = ''
    if (isPending) {
      status = 'Loading...'
    } else if (isRejected) {
      status = 'Error loading PayPal'
    }
    return status
  }

  const handleCreatePayPalOrder = async () => {
    const res = await createPaypalOrder(order.id)

    if (!res.success) {
      toast.error(res.message)
    }

    return res.data
  }
  const handleApprovePayPalOrder = async (data: { orderID: string }) => {
    const res = await approvePaypalOrder(order.id, data)

    if (!res.success) {
      toast.error(res.message)
    } else {
      toast.success(res.message)
    }
  }

  // Button to mark order as paid
  const MarkAsPaidButton = () => {
    const [isPending, startTransition] = useTransition()

    return (
      <Button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const res = await updateOrderToPaidCOD(order.id)
            toast(res.message)
          })
        }
      >
        {isPending ? 'processing...' : 'Mark As Paid'}
      </Button>
    )
  }

  // Button to mark order as delivered
  const MarkAsDeliveredButton = () => {
    const [isPending, startTransition] = useTransition()

    return (
      <Button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const res = await deliverOrder(order.id)
            toast(res.message)
          })
        }
      >
        {isPending ? 'processing...' : 'Mark As Delivered'}
      </Button>
    )
  }
  return (
    <>
      <h1 className="py-4 text-2xl">Order {formatId(order.id)}</h1>
      <div className="grid md:grid-cols-3 md:gap-5">
        <div className="col-span-2 space-y-4 overflow-x-auto">
          <Card>
            <CardContent className="gap-4 p-4">
              <h2 className="pb-4 text-xl">Payment Method</h2>
              <p className="mb-2">{order.paymentMethod}</p>
              {order.isPaid ? (
                <Badge variant="secondary">
                  Paid at {formatDateTime(order.paidAt!).dateTime}
                </Badge>
              ) : (
                <Badge variant="destructive">Not Paid</Badge>
              )}
            </CardContent>
          </Card>
          <Card className="my-2">
            <CardContent className="gap-4 p-4">
              <h2 className="pb-4 text-xl">Shipping Address</h2>
              <p>{order.shippingAddress.fullName}</p>
              <p className="mb-2">
                {order.shippingAddress.streetAddress},{' '}
                {order.shippingAddress.city}
                {order.shippingAddress.postalCode},{' '}
                {order.shippingAddress.country}
              </p>
              {order.isDelivered ? (
                <Badge variant="secondary">
                  Paid at {formatDateTime(order.deliveredAt!).dateTime}
                </Badge>
              ) : (
                <Badge variant="destructive">Not Delivered</Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="gap-4 p-4">
              <h2 className="pb-4 text-xl">Order Items</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.orderItems.map((item) => (
                    <TableRow key={item.slug}>
                      <TableCell>
                        <Link
                          href={`/product/${item.slug}`}
                          className="flex items-center"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={50}
                            height={50}
                          />
                          <span className="px-2">{item.name}</span>
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="px-2">{item.qty}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="px-2">${item.price}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className="gap-4 space-y-4 p-4">
              <div className="flex justify-between">
                <div>Items</div>
                <div> {formatCurrency(order.itemsPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Tax</div>
                <div> {formatCurrency(order.taxPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Shipping</div>
                <div> {formatCurrency(order.shippingPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Total</div>
                <div> {formatCurrency(order.totalPrice)}</div>
              </div>

              {/* Paypal payment */}
              {!order.isPaid && order.paymentMethod === 'PayPal' && (
                <div>
                  <PayPalScriptProvider
                    options={{
                      clientId: paypalClientId
                    }}
                  >
                    <PrintLoadingState />
                    <PayPalButtons
                      createOrder={handleCreatePayPalOrder}
                      onApprove={handleApprovePayPalOrder}
                    />
                  </PayPalScriptProvider>
                </div>
              )}

              {/* Cash On Delivery */}
              {isAdmin &&
                !order.isPaid &&
                order.paymentMethod === 'CashOnDelivery' && (
                  <MarkAsPaidButton />
                )}
              {isAdmin && order.isPaid && !order.isDelivered && (
                <MarkAsDeliveredButton />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

export default OrderDetailsTable
