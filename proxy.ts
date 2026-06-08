import { NextRequest, NextResponse } from "next/server"
import { decrypt } from "@/lib/session"

const protectedRoutes = ["/dashboard"]
const publicRoutes = ["/login", "/signup", "/"]

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))
  const isPublicRoute = publicRoutes.includes(path)

  const sessionCookie = req.cookies.get("session")?.value
  const session = await decrypt(sessionCookie)

  if (isProtectedRoute && !session?.uid) {
    const loginUrl = new URL("/login", req.nextUrl)
    loginUrl.searchParams.set("redirect", path)
    return NextResponse.redirect(loginUrl)
  }

  if (isPublicRoute && session?.uid && path.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
  }

  if (isPublicRoute && session?.uid && (path === "/login" || path === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
