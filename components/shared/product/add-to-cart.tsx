'use client'
import { Button } from '@/components/ui/button'
import { addToCart } from '@/lib/actions/cart.action'
import { CartItem } from '@/types'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

function AddToCart({ item }: { item: CartItem }) {
  const router = useRouter()

  const handleAddToCart = async () => {
    const res = await addToCart(item)

    if (!res.success) {
      toast.error(res.message)
      return
    }

    toast.success(`${item.name} added to cart!`, {
      action: {
        label: 'Go To Cart',
        onClick: () => {
          router.push('/cart')
        }
      }
    })
  }

  return (
    <Button
      type="button"
      onClick={handleAddToCart}
      className="w-full cursor-pointer"
    >
      <Plus /> Add to Cart
    </Button>
  )
}

export default AddToCart
