import { cn } from '@/lib/utils'

function ProductPrice({
  value,
  className
}: {
  value: number
  className?: string
}) {
  const stringValue = value.toFixed(2)

  const [intValue, decimalValue] = stringValue.split('.')
  return (
    <p className={cn('text-2xl', className)}>
      <span className="align-super text-xs">$</span>
      {intValue}
      <span className="align-super text-xs">{decimalValue}</span>
    </p>
  )
}

export default ProductPrice
