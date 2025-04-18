'use server'

import { signIn, signOut } from '@/auth'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { signInFromSchema, signUpFromSchema } from '../validators'
import { hashSync } from 'bcrypt-ts-edge'
import { prisma } from '@/db/prisma'

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
      message: 'User was not registered!'
    }
  }
}
