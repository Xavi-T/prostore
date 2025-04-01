import { APP_NAME } from '@/lib/constant'
import Image from 'next/image'
import Link from 'next/link'
import Menu from './menu'

export default function Header() {
  return (
    <header className="w-full border-b">
      <div className="wrapper flex-between">
        <div className="flex-start">
          <Link href="/" className="flex-start">
            <Image
              src="/images/logo.svg"
              alt="Prostore"
              width={48}
              height={48}
              priority
            />
            <span className="ml-3 hidden text-2xl font-bold lg:block">
              {APP_NAME}
            </span>
          </Link>
        </div>
        <Menu />
      </div>
    </header>
  )
}
