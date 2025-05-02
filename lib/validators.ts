import { z } from 'zod'
import { formatNUmberWithDecimal } from './utils'
import { PAYMENT_METHODS } from './constant'

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

// schema for sign up user
export const signUpFromSchema = z
  .object({
    name: z.string().min(3, 'name must be at least 3 characters long'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z
      .string()
      .min(6, 'Confirm password must be at least 6 characters long')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
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
  userId: z.string().uuid().optional()
})

// schema for shipping address
export const shippingAddressSchema = z.object({
  fullName: z.string().min(3, 'Full name is required'),
  streetAddress: z.string().min(3, 'Street address is required'),
  city: z.string().min(3, 'City is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().min(3, 'Country is required'),
  phone: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional()
})

// schema for payment method
export const paymentMethodSchema = z
  .object({
    type: z.string().min(1, 'Payment type is required')
  })
  .refine((data) => PAYMENT_METHODS.includes(data.type), {
    path: ['type'],
    message: 'Invalid payment method'
  })

// schema for order
export const insertOrderSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  itemsPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  totalPrice: currency,
  paymentMethod: z.string().refine((data) => PAYMENT_METHODS.includes(data), {
    message: 'Invalid payment method'
  }),
  shippingAddress: shippingAddressSchema
})

// schema for inserting an order item
export const insertOrderItemSchema = z.object({
  productId: z.string(),
  slug: z.string(),
  image: z.string(),
  name: z.string(),
  price: currency,
  qty: z.number()
})

// payment results schema
export const paymentResultSchema = z.object({
  id: z.string(),
  status: z.string(),
  email_address: z.string(),
  pricePaid: z.string()
})
