'use client'

import { Button } from '@/components/ui/button'
import { createOrder } from '@/lib/actions/order.action'
import { Check, Loader } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useFormStatus } from 'react-dom'

const PlaceOrderForm = () => {
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const res = await createOrder()
    console.log('🚀 ~ handleSubmit ~ res:', res)

    if (res.redirectTo) {
      router.push(res.redirectTo)
    }
  }

  const PlaceOrderButton = () => {
    const { pending } = useFormStatus()
    return (
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}{' '}
        Place Ordermmm
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <PlaceOrderButton />
    </form>
  )
}

export default PlaceOrderForm
