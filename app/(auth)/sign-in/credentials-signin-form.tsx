'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signInWithCredentials } from '@/lib/actions/user.actions'
import { singInDefaultValues } from '@/lib/constant'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

function CredentialsSignInForm() {
  const [data, action] = useActionState(signInWithCredentials, {
    message: '',
    success: false
  })

  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const SignInButton = () => {
    const { pending } = useFormStatus()
    return (
      <Button variant="default" className="w-full" disabled={pending}>
        {pending ? 'Signing In...' : 'Sign In'}
      </Button>
    )
  }

  return (
    <form action={action}>
      <input type="text" hidden name="callbackUrl" defaultValue={callbackUrl} />
      <div className="space-y-6">
        <div>
          <Label htmlFor="email"></Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            autoComplete="email"
            required
            defaultValue={singInDefaultValues.email}
          />
        </div>
        <div>
          <Label htmlFor="password"></Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            autoComplete="password"
            required
            defaultValue={singInDefaultValues.password}
          />
        </div>
        <div>
          <SignInButton />
        </div>

        {data && !data.success && (
          <div className="text-destructive text-center">{data.message}</div>
        )}
        <div className="text-muted-foreground text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" target="_self" className="link">
            Sign Up
          </Link>
        </div>
      </div>
    </form>
  )
}

export default CredentialsSignInForm
