import {
  cartItemSchema,
  insertCartSchema,
  insertProductSchema,
  shippingAddressSchema
} from './../lib/validators'
import { z } from 'zod'

export type Product = z.infer<typeof insertProductSchema> & {
  id: string
  rating: string
  createdAt: string
}

export type Cart = z.infer<typeof insertCartSchema>
export type CartItem = z.infer<typeof cartItemSchema>
export type ShippingAddress = z.infer<typeof shippingAddressSchema>
