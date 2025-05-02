import NextAuth from 'next-auth'
import { prisma } from './db/prisma'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { compareSync } from 'bcrypt-ts-edge'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { NextAuthConfig } from 'next-auth'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const config = {
  pages: {
    signIn: '/sign-in',
    error: '/sign-in'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' }
      },
      async authorize(credentials) {
        if (credentials === null) return null

        // find user in database
        const user = await prisma.user.findFirst({
          where: {
            email: credentials?.email as string
          }
        })

        // check if user exists and password is correct
        const isMatch = compareSync(
          credentials?.password as string,
          user?.password as string
        )
        if (isMatch) {
          return {
            id: user?.id ?? '', // Ensure id is a non-optional string
            name: user?.name || null,
            email: user?.email || null,
            role: user?.role || null
          }
        }

        return null
      }
    })
  ],
  callbacks: {
    async session({ session, user, token, trigger }: any) {
      session.user.id = token.sub
      session.user.role = token.role
      session.user.name = token.name

      // if there any update, set the user name
      if (trigger === 'update') {
        session.user.name = user.name
      }

      return session
    },

    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.id = user.id
        token.role = user.role

        // if user has no name then use email
        if (user.name === 'NO_NAME') {
          token.name = user.email!.split('@')[0]

          // update the database reflect token name
          await prisma.user.update({
            where: {
              id: user.id
            },
            data: {
              name: token.name
            }
          })
        }

        if (trigger === 'signIn' || trigger === 'signUp') {
          const cookiesObject = await cookies()
          const sessionCartId = cookiesObject.get('sessionCartId')?.value

          if (sessionCartId) {
            // update user cart with session cart id
            const sessionCart = await prisma.cart.findFirst({
              where: {
                sessionCartId: sessionCartId
              }
            })

            if (sessionCart) {
              // delete current user cart
              await prisma.cart.deleteMany({
                where: {
                  userId: user.id,
                  id: {
                    not: sessionCart.id
                  }
                }
              })

              // assign new cart to user
              await prisma.cart.update({
                where: { id: sessionCart.id },
                data: { userId: user.id }
              })
            }
          }
        }
      }

      return token
    },

    authorized({ request, auth }: any) {
      // array of regex patterns to match the request path
      const protectedRoutes = [
        /\/shipping-address/,
        /\/payment-method/,
        /\/place-order/,
        /\/profile/,
        /\/user\/(.*)/,
        /\/order\/(.*)/,
        /\/admin/
      ]

      // get path name from the request
      const { pathname } = request.nextUrl

      // if user is not authenticated and the request path matches any of the protected routes
      if (!auth && protectedRoutes.some((route) => route.test(pathname)))
        return false

      // check for session cart cookies
      if (!request.cookies.get('sessionCartId')) {
        // generate a new cart id cookies
        const sessionCartId = crypto.randomUUID()

        // create new request header
        const newRequestHeader = new Headers(request.headers)

        // create response and add new header
        const response = NextResponse.next({
          request: {
            headers: newRequestHeader
          }
        })

        // set newly generate sessionId cart in response cookies
        response.cookies.set('sessionCartId', sessionCartId)

        return response
      } else {
        return true
      }
    }
  }
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
