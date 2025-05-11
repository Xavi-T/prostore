'use server'

import { auth } from '@/auth'
import { prisma } from '@/db/prisma'
import { CartItem, PaymentResult } from '@/types'
import { revalidatePath } from 'next/cache'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { paypal } from '../paypal'
import { convertToPlainObject, formatErrorMessage } from '../utils'
import { insertOrderSchema } from '../validators'
import { getMyCart } from './cart.action'
import { getUserById } from './user.actions'
import { PAGE_SIZE } from '../constant'

// create order and order items
export async function createOrder() {
  try {
    const session = await auth()
    if (!session) throw new Error('User is not authenticated')

    const cart = await getMyCart()
    const userId = session?.user?.id
    if (!userId) throw new Error('User not found')

    const user = await getUserById(userId)

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: 'Your cart is empty',
        redirectTo: '/cart'
      }
    }

    if (!user.address) {
      return {
        success: false,
        message: 'No shipping address',
        redirectTo: '/shipping-address'
      }
    }

    if (!user.paymentMethod) {
      return {
        success: false,
        message: 'No payment method',
        redirectTo: '/payment-method'
      }
    }

    // Create order object
    const order = insertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice
    })

    // Create a transaction to create order and order items in database
    const insertedOrderId = await prisma.$transaction(async (tx) => {
      // Create order
      const insertedOrder = await tx.order.create({ data: order }) // WARNING: cast to any to avoid type error
      // Create order items from the cart items
      for (const item of cart.items as CartItem[]) {
        await tx.orderItem.create({
          data: {
            ...item,
            price: item.price,
            orderId: insertedOrder.id
          }
        })
      }
      // Clear cart
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          totalPrice: 0,
          taxPrice: 0,
          shippingPrice: 0,
          itemsPrice: 0
        }
      })

      return insertedOrder.id
    })

    if (!insertedOrderId) throw new Error('Order not created')

    return {
      success: true,
      message: 'Order created',
      redirectTo: `/order/${insertedOrderId}`
    }
  } catch (error) {
    if (isRedirectError(error)) throw error
    return { success: false, message: formatErrorMessage(error) }
  }
}

// get order by id
export async function getOrderById(orderId: string) {
  const data = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderItems: true,
      user: { select: { name: true, email: true } }
    }
  })

  return convertToPlainObject(data)
}

// create a paypal order
export async function createPaypalOrder(orderId: string) {
  try {
    const order = await getOrderById(orderId)
    if (!order) throw new Error('Order not found')

    const paypalOrder = await paypal.createOrder(Number(order.totalPrice))

    // update order with paypal order id
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentResult: {
          id: paypalOrder.id,
          email_address: '',
          status: '',
          pricePaid: 0
        }
      }
    })

    return {
      success: true,
      message: 'Paypal order created successfully!',
      data: paypalOrder.id
    }
  } catch (error) {
    return { success: false, message: formatErrorMessage(error) }
  }
}

// approve paypal order and update order to paid
export async function approvePaypalOrder(
  orderId: string,
  data: { orderID: string }
) {
  try {
    const order = await getOrderById(orderId)
    if (!order) throw new Error('Order not found')

    const captureData = await paypal.capturePayment(data.orderID)

    if (
      !captureData ||
      captureData.id !== (order.paymentResult as PaymentResult)?.id ||
      captureData.status !== 'COMPLETED'
    ) {
      throw new Error('Error in paypal payment!')
    }

    // update order with payment result
    await updateOrderToPaid({
      orderId,
      paymentResult: {
        id: captureData.id,
        email_address: captureData.payer.email_address,
        status: captureData.status,
        pricePaid:
          captureData.purchase_units[0].payments.captures[0].amount.value
      }
    })

    revalidatePath(`/order/${orderId}`)

    return {
      success: true,
      message: 'Paypal order approved successfully!'
    }
  } catch (error) {
    return { success: false, message: formatErrorMessage(error) }
  }
}

export async function updateOrderToPaid({
  orderId,
  paymentResult
}: {
  orderId: string
  paymentResult?: PaymentResult
}) {
  // get order from db
  const order = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderItems: true
    }
  })

  if (!order) {
    throw new Error('Order not found')
  }

  if (order.isPaid) {
    return {
      success: false,
      message: 'Order already paid'
    }
  }

  // transaction to update order and account for products stock
  await prisma.$transaction(async (tx) => {
    // iterate over products and update stock
    for (const item of order.orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: { increment: -item.qty }
        }
      })

      // set order as paid
      await tx.order.update({
        where: { id: orderId },
        data: {
          isPaid: true,
          paidAt: new Date(),
          paymentResult: paymentResult
        }
      })
    }
  })

  // get updated order after transaction
  const updatedOrder = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderItems: true,
      user: { select: { name: true, email: true } }
    }
  })

  if (!updatedOrder) {
    throw new Error('Order not found')
  }
}

// Get user's orders
export async function getMyOrders({
  limit = PAGE_SIZE,
  page
}: {
  limit?: number
  page: number
}) {
  const session = await auth()
  if (!session) throw new Error('User is not authorized')

  const data = await prisma.order.findMany({
    where: { userId: session?.user?.id },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: (page - 1) * limit
  })

  const dataCount = await prisma.order.count({
    where: { userId: session?.user?.id }
  })

  return {
    data,
    totalPages: Math.ceil(dataCount / limit)
  }
}
