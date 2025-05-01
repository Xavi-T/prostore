import { getOrderById } from '@/lib/actions/order.action'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Order Details'
}

async function OrderDetailsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params

  const order = await getOrderById(id)
  if (!order) return notFound()
  return <div>OrderDetailsPag {id}e</div>
}

export default OrderDetailsPage
