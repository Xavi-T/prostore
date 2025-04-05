import NextAuth from 'next-auth'
import { prisma } from './db/prisma'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { compareSync } from 'bcrypt-ts-edge'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { NextAuthConfig } from 'next-auth'

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

      // if there any update, set the user name
      if (trigger === 'update') {
        session.user.name = user.name
      }

      return session
    }
  }
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
