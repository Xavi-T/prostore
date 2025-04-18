'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUpUser } from '@/lib/actions/user.actions'
import { singUpDefaultValues } from '@/lib/constant'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

function SignUpForm() {
  const [data, action] = useActionState(signUpUser, {
    message: '',
    success: false
  })

  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const SignUpButton = () => {
    const { pending } = useFormStatus()
    return (
      <Button variant="default" className="w-full" disabled={pending}>
        {pending ? 'Submitting...' : 'Sign Up'}
      </Button>
    )
  }

  return (
    <form action={action}>
      <input type="text" hidden name="callbackUrl" defaultValue={callbackUrl} />
      <div className="space-y-6">
        <div>
          <Label className="mb-2" htmlFor="name">
            Name
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Name"
            autoComplete="name"
            required
            defaultValue={singUpDefaultValues.name}
          />
        </div>
        <div>
          <Label className="mb-2" htmlFor="email">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            autoComplete="email"
            required
            defaultValue={singUpDefaultValues.email}
          />
        </div>
        <div>
          <Label className="mb-2" htmlFor="password">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            autoComplete="password"
            required
            defaultValue={singUpDefaultValues.password}
          />
        </div>
        <div>
          <Label className="mb-2" htmlFor="confirmPassword">
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            autoComplete="confirmPassword"
            required
            defaultValue={singUpDefaultValues.confirmPassword}
          />
        </div>
        <div>
          <SignUpButton />
        </div>

        {data && !data.success && (
          <div className="text-destructive text-center">{data.message}</div>
        )}
        <div className="text-muted-foreground text-center text-sm">
          Already have an account?{' '}
          <Link href="/sign-in" target="_self" className="link">
            Sign In
          </Link>
        </div>
      </div>
    </form>
  )
}

export default SignUpForm
