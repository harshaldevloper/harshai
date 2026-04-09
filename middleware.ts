import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  // Routes that don't require authentication
  publicRoutes: [
    '/',
    '/about',
    '/pricing',
    '/templates',
    '/use-cases',
    '/demo',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/privacy',
    '/terms',
    '/refund-policy',
    '/contact',
    '/product/:path*',
    '/api/webhooks/:path*',
  ],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
