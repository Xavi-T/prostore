import ProductCarousel from '@/components/shared/product/product-carousel'
import ProductList from '@/components/shared/product/product-list'
import ViewAllProductsButton from '@/components/ui/view-all-products-button'
import {
  getFeaturedProducts,
  getLatestProducts
} from '@/lib/actions/product.action'

export default async function HomePage() {
  const latestProducts = await getLatestProducts()
  const featuredProducts = await getFeaturedProducts()
  return (
    <>
      {featuredProducts.length > 0 && (
        <ProductCarousel data={featuredProducts} />
      )}
      <ProductList data={latestProducts} title="Newest Arrivals" limit={4} />
      <ViewAllProductsButton />
      {/* <DealCountdown /> */}
      {/* <IconBoxes /> */}
    </>
  )
}
