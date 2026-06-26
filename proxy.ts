import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - manifest.json, sw.js, workbox-* (PWA files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.json|sw.js|workbox-.*|icons/).*)',
  ],
};

export function proxy(req: NextRequest) {
  const url = req.nextUrl;

  // Get hostname of request (e.g. demo.vercel.pub, demo.localhost:3000)
  const hostname = req.headers
    .get('host')!
    .replace('.localhost:3000', `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'}`);

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

  // Check if we have a custom subdomain
  // e.g., if hostname is 'school.localhost:3000', and rootDomain is 'localhost:3000',
  // then subdomain is 'school'
  // But wait, the replace above makes it 'school.localhost:3000'.
  // Let's do it simpler.
  let currentHost = req.headers.get('host') || 'localhost:3000';
  
  // Clean up port for easier matching if needed, but we keep it here.
  let tenant = null;

  if (currentHost.includes('localhost:3000')) {
    const parts = currentHost.split('.localhost:3000');
    if (parts[0] && parts[0] !== 'localhost:3000' && parts[0] !== 'www') {
      tenant = parts[0];
    }
  } else {
    // Production domain matching (e.g. edtech.com)
    const productionDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'edtech.com';
    if (currentHost.endsWith('.' + productionDomain)) {
      const parts = currentHost.split('.' + productionDomain);
      if (parts[0] && parts[0] !== 'www') {
        tenant = parts[0];
      }
    }
  }

  if (tenant) {
    // Rewrite to the tenant dynamic route
    // /about -> /[tenant]/about
    return NextResponse.rewrite(new URL(`/${tenant}${url.pathname}${url.search}`, req.url));
  }

  return NextResponse.next();
}
