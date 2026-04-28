import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Match all pathnames except:
    // - API routes (/api)
    // - Next.js internals (/_next)
    // - Vercel internals (/_vercel)
    // - Static files (containing a dot, e.g. favicon.ico)
    '/((?!api|trpc|_next|_vercel|.*\\..*).*)' ,
  ],
};
