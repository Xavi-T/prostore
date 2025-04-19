'use server'

import { CartItem } from '@/types'
import { convertToPlainObject, formatErrorMessage, round2 } from '../utils'
import { cookies } from 'next/headers'
import { auth } from '@/auth'
import { prisma } from '@/db/prisma'
import { cartItemSchema, insertCartSchema } from '../validators'
import { revalidatePath } from 'next/cache'

const calcPrice = (items: CartItem[]) => {
  const itemsPrice = round2(
    items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
  )
  const shippingPrice = round2(itemsPrice > 100 ? 0 : 10)
  const taxPrice = round2(0.15 * itemsPrice)
  const totalPrice = round2(itemsPrice + shippingPrice + taxPrice)

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2)
  }
}
export async function addToCart(data: CartItem) {
  try {
    // check for cart cookies
    const sessionCartId = (await cookies()).get('sessionCartId')?.value
    if (!sessionCartId) throw new Error('Session cart id not found!')

    // get session and user id
    const session = await auth()
    const userId = session?.user?.id ? (session.user.id as string) : undefined

    const cart = await getMyCart()

    // parse and validate item
    const item = cartItemSchema.parse(data)

    // find product in database
    const product = await prisma.product.findFirst({
      where: { id: item.productId }
    })

    if (!product) throw new Error('Product not found!')

    if (!cart) {
      // create new cart
      const newCart = insertCartSchema.parse({
        sessionCartId: sessionCartId,
        userId: userId,
        items: [item],
        ...calcPrice([item])
      })

      //   add to database
      await prisma.cart.create({
        data: newCart
      })

      // revalidate product page
      revalidatePath(`/product/${item.slug}`)

      return {
        success: true,
        message: 'Item added to cart successfully!'
      }
    } else {
      return {
        success: true,
        message: 'Item added to cart successfully!'
      }
    }
  } catch (error) {
    return {
      success: false,
      message: formatErrorMessage(error)
    }
  }
}

export async function getMyCart() {
  // check for cart cookies
  const sessionCartId = (await cookies()).get('sessionCartId')?.value
  if (!sessionCartId) throw new Error('Session cart id not found!')

  // get session and user id
  const session = await auth()
  const userId = session?.user?.id ? (session.user.id as string) : undefined

  // get user cart from database
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId: userId } : { sessionCartId: sessionCartId }
  })

  if (!cart) return undefined

  // convert to plain object
  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString()
  })
}
