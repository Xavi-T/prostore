'use client'

import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useState } from 'react'

function ProductImages({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0)

  return (
    <div className="space-y-4">
      <Image
        src={images[current]}
        alt="product image"
        width={1000}
        height={1000}
        className="min-h-[300px] object-cover object-center"
      />

      <div className="flex">
        {images.map((image, index) => (
          <div
            className={cn(
              'mr-2 cursor-pointer rounded border-2 hover:border-gray-600',
              current === index && 'border-gray-500'
            )}
            key={index}
            onClick={() => {
              setCurrent(index)
            }}
          >
            <Image
              src={image}
              alt="product image"
              width={100}
              height={100}
              className="object-cover object-center"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductImages
