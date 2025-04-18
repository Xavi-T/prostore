import { auth } from '@/auth'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { signOutUser } from '@/lib/actions/user.actions'
import { UserIcon } from 'lucide-react'
import Link from 'next/link'

async function UserButton() {
  const session = await auth()

  if (!session) {
    return (
      <Button asChild>
        <Link href="/sign-in">
          <UserIcon /> Sign In
        </Link>
      </Button>
    )
  }

  const firstCharName = session.user?.name?.charAt(0).toUpperCase() || 'U'

  return (
    <div className="-gap-2 flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-amber-800"
            >
              {firstCharName}
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-1">
              <div className="text-sm leading-none font-medium">
                {session.user?.name}
              </div>
              <div className="text-muted-foreground leading-none font-medium">
                {session.user?.email}
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuItem className="mb-1 p-0">
            <form action={signOutUser}>
              <Button
                className="h-4 w-full justify-start px-2 py-4"
                variant="ghost"
              >
                Sign Out
              </Button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default UserButton
