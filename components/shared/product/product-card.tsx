import { Card, CardContent, CardHeader } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'
import ProductPrice from './product-price'

function ProductCard({ product }: { product: any }) {
  const { name, images, slug, rating, stock, price } = product
  return (
    <Card className="w-full max-w-xs">
      <CardHeader className="items-center p-0">
        <Link href={`/product/${slug}`} className="flex flex-col items-center">
          <Image src={images[0]} alt={name} width={300} height={300} priority />
        </Link>
      </CardHeader>
      <CardContent className="grid gap-4 p-4">
        <div className="text-xs">{product.brand}</div>
        <Link href={`/product/${slug}`}>
          <h2 className="text-sm font-medium">{name}</h2>
        </Link>
        <div className="flex-between gap-4">
          <p>{rating} Starts</p>
          {stock > 0 ? (
            <ProductPrice value={Number(price)} />
          ) : (
            <p className="text-red-500">Out of Stock</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ProductCard
