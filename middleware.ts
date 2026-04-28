import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
    matcher: [
        // Match all pathnames except:
        // - API routes
        // - Next.js internals
        // - Static files (with extension)
        // - Vercel internals
        '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
    ],
};
