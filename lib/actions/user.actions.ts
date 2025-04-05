'use server'

import { signIn, signOut } from '@/auth'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { signInFromSchema } from '../validators'

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
