import { getMyCart } from '@/lib/actions/cart.action'
import CartTable from './cart-table'

export const metadata = {
  title: 'Shopping Cart',
  description: 'Cart page'
}
async function CartPage() {
  const cart = await getMyCart()
  return (
    <div>
      <CartTable
        cart={cart ? { ...cart, userId: cart.userId ?? undefined } : undefined}
      />
    </div>
  )
}

export default CartPage
