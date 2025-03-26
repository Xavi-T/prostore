import { APP_NAME } from '@/lib/constant'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  return (
    <footer className="border-t">
      <div className="flex-center p-5">
        {currentYear} {APP_NAME}. All rights reserved.
      </div>
    </footer>
  )
}
