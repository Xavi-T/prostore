'use client'

import { Button } from '@/components/ui/button'
import Image from 'next/image'

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Image
        src="/images/logo.svg"
        width={48}
        height={48}
        alt="logo"
        priority
      />
      <div className="max-w-md rounded-lg p-6 text-center shadow-md">
        <h1 className="mb-4 text-3xl font-bold">Not Found</h1>
        <p className="text-destructive">Could not find requested page!</p>
        <Button
          variant="outline"
          className="mt-4 ml-2"
          onClick={() => {
            window.location.href = '/'
          }}
        >
          Back To Home
        </Button>
      </div>
    </div>
  )
}

export default NotFoundPage
