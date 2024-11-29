import authConfig  from "@/auth.config";
import NextAuth from "next-auth";

import {
  DEFAULT_LOGIN_REDIRECT,
  authRoutes,
  publicRoutes,
  apiAuthPrefix
} from "@/routes";

import { NextResponse } from "next/server";
import { RolUsuario } from "@prisma/client";

const { auth } = NextAuth(authConfig);

import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET;
export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  // console.log("Request URL:", nextUrl.pathname);
  // console.log("User logged in:", isLoggedIn);

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      // Accede al rol del usuario correctamente
      const userRole = req.auth?.user?.rol;

      if (userRole === RolUsuario.Administrador) {
        return NextResponse.redirect(new URL("/admin", nextUrl));
      } else if (userRole === RolUsuario.Usuario) {
        return NextResponse.redirect(new URL("/cliente", nextUrl));
      }

      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn && !isPublicRoute) {
    // Es posible que esto sea lo que corrige lo del usuario al no poder loguearse
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

    console.log("Redirigiendo al login con el callback URL:", encodedCallbackUrl);
    
    // return Response.redirect(new URL("/auth/login", nextUrl));
    return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
  }
  return NextResponse.next();
});

export const config = {
  // matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}