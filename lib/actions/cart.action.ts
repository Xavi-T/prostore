'use server'

import { CartItem } from '@/types'
import { convertToPlainObject, formatErrorMessage, round2 } from '../utils'
import { cookies } from 'next/headers'
import { auth } from '@/auth'
import { prisma } from '@/db/prisma'
import { cartItemSchema, insertCartSchema } from '../validators'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'

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
        message: `${item.name} added to cart successfully!`
      }
    } else {
      // check item already in cart
      const existItem = (cart.items as CartItem[]).find(
        (i) => i.productId === item.productId
      )
      // check item exist in cart
      if (existItem) {
        // check stock
        if (product.stock < existItem.qty + 1) {
          throw new Error('Product out of stock!')
        }

        // increase quantity
        ;(cart.items as CartItem[]).find(
          (i) => i.productId === item.productId
        )!.qty = existItem.qty + 1
      } else {
        // if doesn't exist in cart
        // check stock
        if (product.stock < 1) {
          throw new Error('Product out of stock!')
        }
        // add item to cart.items
        cart.items.push(item)
      }

      // save to database
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items as Prisma.CartUpdateitemsInput[],
          ...calcPrice(cart.items as CartItem[])
        }
      })

      revalidatePath(`/product/${item.slug}`)
      return {
        success: true,
        message: `${item.name} ${existItem ? 'update in' : 'add to'} cart successfully!`
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

export async function removeItemFromCart(productId: string) {
  try {
    // check for cart cookies
    const sessionCartId = (await cookies()).get('sessionCartId')?.value
    if (!sessionCartId) throw new Error('Session cart id not found!')

    // get product from database
    const product = await prisma.product.findFirst({
      where: { id: productId }
    })
    if (!product) throw new Error('Product not found!')

    // get user cart
    const cart = await getMyCart()
    if (!cart) throw new Error('Cart not found!')

    // check for item in cart
    const existItem = (cart.items as CartItem[]).find(
      (i) => i.productId === productId
    )
    if (!existItem) throw new Error('Item not found in cart!')

    // check if only one item in cart
    if (existItem.qty === 1) {
      // remove item from cart
      cart.items = (cart.items as CartItem[]).filter(
        (i) => i.productId !== existItem.productId
      )
    } else {
      // decrease item quantity
      ;(cart.items as CartItem[]).find(
        (i) => i.productId === existItem.productId
      )!.qty = existItem.qty - 1
    }

    // save to database
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items as Prisma.CartUpdateitemsInput[],
        ...calcPrice(cart.items as CartItem[])
      }
    })

    // revalidate product page
    revalidatePath(`/product/${existItem.slug}`)
    return {
      success: true,
      message: `${existItem.name} removed from cart successfully!`
    }
  } catch (error) {
    return {
      success: false,
      message: formatErrorMessage(error)
    }
  }
}
