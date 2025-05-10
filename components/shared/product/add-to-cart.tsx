'use client'
import { Button } from '@/components/ui/button'
import { addItemToCart, removeItemFromCart } from '@/lib/actions/cart.action'
import { Cart, CartItem } from '@/types'
import { Loader, Minus, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'

function AddToCart({ item, cart }: { cart?: Cart; item: CartItem }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleAddToCart = async () => {
    startTransition(async () => {
      const res = await addItemToCart(item)

      if (!res.success) {
        toast.error(res.message)
        return
      }

      toast.success(res.message, {
        action: {
          label: 'Go To Cart',
          onClick: () => {
            router.push('/cart')
          }
        }
      })
    })
  }

  // handle remove from cart
  const handleRemoveFromCart = async () => {
    startTransition(async () => {
      const res = await removeItemFromCart(item.productId)
      if (!res.success) {
        toast.error(res.message)
        return
      }
      toast.success(res.message, {
        action: {
          label: 'Go To Cart',
          onClick: () => {
            router.push('/cart')
          }
        }
      })
      return
    })
  }

  // check if the item is already in the cart
  const existItem =
    cart && cart.items.find((i) => i.productId === item.productId)

  return existItem ? (
    <div>
      <Button
        type="button"
        variant={'outline'}
        onClick={handleRemoveFromCart}
        className="h-4 w-4"
      >
        {isPending ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          <Minus className="h-4 w-4" />
        )}
      </Button>
      <span className="px-2">{existItem.qty}</span>
      <Button
        type="button"
        variant={'outline'}
        onClick={handleAddToCart}
        className="h-4 w-4"
      >
        {isPending ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
      </Button>
    </div>
  ) : (
    <Button
      type="button"
      onClick={handleAddToCart}
      className="w-full cursor-pointer"
    >
      {isPending ? (
        <Loader className="h-4 w-4 animate-spin" />
      ) : (
        <Plus className="h-4 w-4" />
      )}{' '}
      Add to Cart
    </Button>
  )
}

export default AddToCart
