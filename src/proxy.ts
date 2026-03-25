import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const PROTECTED_ROUTES = ["/employee/dashboard"];

async function isAuthenticated(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/auth/validate`, {
      headers: { Cookie: `jwt=${token}` },
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.valid === true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("jwt")?.value;

  const isProtected = PROTECTED_ROUTES.includes(pathname);
  const isLoginPage = pathname.startsWith("/employee/login");

  const authenticated = token ? await isAuthenticated(token) : false;

  if (isProtected && !authenticated) {
    return NextResponse.redirect(new URL("/employee/login", request.url));
  }

  if (isLoginPage && authenticated) {
    return NextResponse.redirect(new URL("/employee/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/employee/dashboard/:path*", "/employee/login"],
};
