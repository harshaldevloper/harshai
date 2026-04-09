export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/builder/:path*',
    '/settings/:path*',
    '/api/protected/:path*',
  ],
}
