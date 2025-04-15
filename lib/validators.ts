import { z } from 'zod'
import { formatNUmberWithDecimal } from './utils'

const currency = z
  .string()
  .refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNUmberWithDecimal(Number(value))),
    {
      message: 'Price must be a valid number with two decimal places'
    }
  )

// schema for inserting  products
export const insertProductSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  slug: z.string().min(3, 'Slug must be at least 3 characters long'),
  category: z.string().min(3, 'Category must be at least 3 characters long'),
  brand: z.string().min(3, 'Brand must be at least 3 characters long'),
  description: z
    .string()
    .min(3, 'Description must be at least 3 characters long'),
  stock: z.coerce.number(),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  isFeatured: z.boolean().optional(),
  banner: z.string().optional(),
  price: currency
})

// schema for signing user
export const signInFromSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long')
})

// cart schemas
export const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  qty: z.number().int().nonnegative('Quantity must be a positive integer'),
  image: z.string().min(1, 'Image is required'),
  price: currency
})

export const insertCartSchema = z.object({
  items: z.array(cartItemSchema),
  itemsPrice: currency,
  totalPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  sessionCartId: z.string().min(1, 'Session cart ID is required'),
  userId: z.string().optional().nullable()
})
