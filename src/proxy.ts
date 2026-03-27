import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const PROTECTED_ROUTES = [
  "/dashboard",
  "/customers",
  "/events",
  "/bookings",
  "/employees",
];

async function isAuthenticated(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/auth/validate`, {
      headers: { Cookie: `jwt=${token}` },
      credentials: "include",
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
  const isLoginPage = pathname.startsWith("/login");

  const authenticated = token ? await isAuthenticated(token) : false;

  if (isProtected && !authenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isLoginPage && authenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/customers",
    "/events",
    "/bookings",
    "/employees",
    "/login",
  ],
};
