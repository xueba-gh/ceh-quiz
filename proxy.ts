import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifyToken } from "@/lib/session";

export default function proxy(req: NextRequest) {
  const loggedIn = verifyToken(req.cookies.get(SESSION_COOKIE)?.value);
  const onLogin = req.nextUrl.pathname === "/login";

  if (!loggedIn && !onLogin) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  if (loggedIn && onLogin) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }
  return NextResponse.next();
}

// Leave static assets, icons and the manifest public so the app can still be installed.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|apple-icon.png|icon-.*\\.png).*)"],
};
