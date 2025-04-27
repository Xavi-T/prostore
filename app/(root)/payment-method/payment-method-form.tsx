'use client'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { updateUserPaymentMethod } from '@/lib/actions/user.actions'
import { DEFAULT_PAYMENT_METHOD, PAYMENT_METHODS } from '@/lib/constant'
import { paymentMethodSchema } from '@/lib/validators'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Loader } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

function PaymentMethodForm({
  preferredPaymentMethod
}: {
  preferredPaymentMethod: string | null
}) {
  const route = useRouter()

  const form = useForm<z.infer<typeof paymentMethodSchema>>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      type: preferredPaymentMethod || DEFAULT_PAYMENT_METHOD
    }
  })

  const [isPending, startTransition] = useTransition()

  const onSubmit = async (values: z.infer<typeof paymentMethodSchema>) => {
    startTransition(async () => {
      const res = await updateUserPaymentMethod(values)

      if (!res.success) {
        toast.error(res.message)
        return
      }

      route.push('/place-order')
    })
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="h2-bold mt-4">Payment method</div>
      <p className="text-muted-foreground text-sm">
        Please select the payment method you want to use
      </p>
      <Form {...form}>
        <form
          method="post"
          className="space-y-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-5 md:flex-row">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      className="flex flex-col space-y-2"
                    >
                      {PAYMENT_METHODS.map((method) => (
                        <FormItem
                          key={method}
                          className="flex items-center space-y-0 space-x-3"
                        >
                          <FormControl>
                            <RadioGroupItem
                              value={method}
                              checked={field.value === method}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {method}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex-2 gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}{' '}
              Continue
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default PaymentMethodForm
