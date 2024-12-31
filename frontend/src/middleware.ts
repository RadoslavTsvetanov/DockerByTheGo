// we are doing it as a middleware since we dont want the user to be able to manipulate the dom for unauthorized access

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export function middleware(request: NextRequest) {
  const auth_cookie_obj = request.cookies.get("auth");
  if (!request.url.includes("/auth").valueOf() && !auth_cookie_obj) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
}

export const config = {
  matcher: "/:path*",
};
