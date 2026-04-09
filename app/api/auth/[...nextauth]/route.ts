import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // For now, allow any email (demo mode)
        // TODO: Implement proper password auth with bcrypt
        if (credentials?.email) {
          return {
            id: credentials.email,
            email: credentials.email,
            name: credentials.email.split('@')[0],
            image: null,
          }
        }
        return null
      }
    })
  ],
  pages: {
    signIn: '/sign-in',
    signOut: '/sign-in',
    error: '/sign-in',
  },
  callbacks: {
    async session({ session, user }) {
      if (user) {
        session.user = user
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    }
  },
  session: {
    strategy: "database",
  },
  database: process.env.DATABASE_URL,
})

export { handler as GET, handler as POST }
