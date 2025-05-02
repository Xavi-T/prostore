import { getOrderById } from '@/lib/actions/order.action'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import OrderDetailsTable from './order-detail-table'
import { ShippingAddress } from '@/types'

export const metadata: Metadata = {
  title: 'Order Details'
}

async function OrderDetailsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params

  const order = await getOrderById(id)
  if (!order) return notFound()

  return (
    <OrderDetailsTable
      order={{
        ...order,
        shippingAddress: order.shippingAddress as ShippingAddress
      }}
      paypalClientId={process.env.PAYPAL_CLIENT_ID || 'sb'}
    />
  )
}

export default OrderDetailsPage
