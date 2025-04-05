'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { singInDefaultValues } from '@/lib/constant'
import Link from 'next/link'

function CredentialsSignInForm() {
  return (
    <form>
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
          <Button variant="default" className="w-full">
            Sign In
          </Button>
        </div>
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
