import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


const publicRoutes = ['/auth'];
const protectedRoutes = ['/dashboard', '/projects/:id'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (!token && isProtectedRoute) {
    const response = NextResponse.redirect(new URL('/auth', request.url));
    return response;
  }

  if (token && isPublicRoute) {
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 