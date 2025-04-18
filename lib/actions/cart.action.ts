'use server'

import { CartItem } from '@/types'

export async function addToCart(data: CartItem) {
  return {
    success: false,
    message: 'Item added to cart successfully!'
  }
}
