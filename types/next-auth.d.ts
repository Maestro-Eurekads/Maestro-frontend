import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id?: string
      data?: any
      email?: string
      name?: string
      randomKey?: string
      agency_user?: any
      clients?: number[] // Array of client IDs
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    data?: any
    randomKey?: string
    agency_user?: any
    clients?: number[] // Array of client IDs
  }
} 