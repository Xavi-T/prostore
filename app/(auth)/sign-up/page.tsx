import { auth } from '@/auth'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { APP_NAME } from '@/lib/constant'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import SignUpForm from './sign-up-form'

export const metadata = {
  title: 'Sign Up'
}

async function SignUpPage(props: {
  searchParams: Promise<{
    callbackUrl: string
  }>
}) {
  const { callbackUrl } = await props.searchParams
  const session = await auth()

  if (session) {
    redirect(callbackUrl || '/')
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <Card>
        <CardHeader className="space-y-4">
          <Link href="/" className="flex-center">
            <Image
              src="/images/logo.svg"
              width={100}
              height={100}
              alt={`${APP_NAME} logo`}
            />
          </Link>
        </CardHeader>
        <CardTitle className="text-center">Create an account</CardTitle>
        <CardDescription className="text-center">
          Enter your details to create an account
        </CardDescription>
        <CardContent>
          <SignUpForm />
        </CardContent>
      </Card>
    </div>
  )
}

export default SignUpPage
