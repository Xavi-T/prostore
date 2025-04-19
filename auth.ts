import NextAuth from 'next-auth'
import { prisma } from './db/prisma'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { compareSync } from 'bcrypt-ts-edge'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { NextAuthConfig } from 'next-auth'
import { NextResponse } from 'next/server'

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
      }

      return token
    },
    authorized({ request, auth }: any) {
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
