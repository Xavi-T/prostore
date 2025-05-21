'use server'

import { auth, signIn, signOut } from '@/auth'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import {
  paymentMethodSchema,
  shippingAddressSchema,
  signInFromSchema,
  signUpFromSchema,
  updateUserSchema
} from '../validators'
import { hashSync } from 'bcrypt-ts-edge'
import { prisma } from '@/db/prisma'
import { formatErrorMessage } from '../utils'
import { ShippingAddress } from '@/types'
import { z } from 'zod'
import { PAGE_SIZE } from '../constant'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function signInWithCredentials(prev: unknown, formData: FormData) {
  try {
    const user = signInFromSchema.parse({
      email: formData.get('email'),
      password: formData.get('password')
    })

    await signIn('credentials', user)

    return {
      success: true,
      message: 'Sign in successfully!'
    }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }

    return {
      success: false,
      message: 'Invalid email or password!'
    }
  }
}

export async function signOutUser() {
  await signOut()
}

// sign up user
export async function signUpUser(pre: unknown, formData: FormData) {
  try {
    const user = signUpFromSchema.parse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword')
    })

    const hashedPassword = hashSync(user.password, 10)

    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: hashedPassword
      }
    })

    await signIn('credentials', {
      email: user.email,
      password: user.password
    })

    return {
      success: true,
      message: 'Sign up successfully!'
    }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }

    return {
      success: false,
      message: formatErrorMessage(error)
    }
  }
}

// get user by id
export async function getUserById(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId }
  })
  if (!user) {
    throw new Error('User not found!')
  }
  return user
}

// update user's address
export async function updateUserAddress(data: ShippingAddress) {
  try {
    const session = await auth()

    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id }
    })

    if (!currentUser) throw new Error('User not found!')

    const address = shippingAddressSchema.parse(data)

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { address }
    })

    return {
      success: true,
      message: 'Address updated successfully!'
    }
  } catch (error) {
    return {
      success: false,
      message: formatErrorMessage(error)
    }
  }
}

// update user's payment method
export async function updateUserPaymentMethod(
  data: z.infer<typeof paymentMethodSchema>
) {
  try {
    const session = await auth()
    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id }
    })

    if (!currentUser) throw new Error('User not found!')

    const paymentMethod = paymentMethodSchema.parse(data)

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { paymentMethod: paymentMethod.type }
    })

    return {
      success: true,
      message: 'Payment method updated successfully!'
    }
  } catch (error) {
    return {
      success: false,
      message: formatErrorMessage(error)
    }
  }
}

// Update the user profile
export async function updateProfile(user: { name: string; email: string }) {
  try {
    const session = await auth()

    const currentUser = await prisma.user.findFirst({
      where: {
        id: session?.user?.id
      }
    })

    if (!currentUser) throw new Error('User not found')

    await prisma.user.update({
      where: {
        id: currentUser.id
      },
      data: {
        name: user.name
      }
    })

    return {
      success: true,
      message: 'User updated successfully'
    }
  } catch (error) {
    return { success: false, message: formatErrorMessage(error) }
  }
}

// Get all the users
export async function getAllUsers({
  limit = PAGE_SIZE,
  page,
  query
}: {
  limit?: number
  page: number
  query: string
}) {
  const queryFilter: Prisma.UserWhereInput =
    query && query !== 'all'
      ? {
          name: {
            contains: query,
            mode: 'insensitive'
          } as Prisma.StringFilter
        }
      : {}

  const data = await prisma.user.findMany({
    where: {
      ...queryFilter
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: (page - 1) * limit
  })

  const dataCount = await prisma.user.count()

  return {
    data,
    totalPages: Math.ceil(dataCount / limit)
  }
}

// Delete a user
export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({ where: { id } })

    revalidatePath('/admin/users')

    return {
      success: true,
      message: 'User deleted successfully'
    }
  } catch (error) {
    return {
      success: false,
      message: formatErrorMessage(error)
    }
  }
}

// Update a user
export async function updateUser(user: z.infer<typeof updateUserSchema>) {
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        role: user.role
      }
    })

    revalidatePath('/admin/users')

    return {
      success: true,
      message: 'User updated successfully'
    }
  } catch (error) {
    return { success: false, message: formatErrorMessage(error) }
  }
}
