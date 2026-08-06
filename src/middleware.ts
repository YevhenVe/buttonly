import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Keep old /u/username links working → redirect to /username
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const legacy = pathname.match(/^\/u\/([a-z0-9_]{3,20})\/?$/i);
  if (legacy) {
    const url = request.nextUrl.clone();
    url.pathname = `/${legacy[1]!.toLowerCase()}`;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/u/:username*"],
};
