import cookie from "cookie";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

function generateTrackingID() {
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);

  //@ts-ignore
  const base64url = btoa(String.fromCharCode.apply(null, randomBytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  return base64url;
}

export function middleware(request: NextRequest) {
  const headers = new Headers();

  const cookies_header = request.headers.get("cookie");
  const cookies = cookie.parse(cookies_header || "");

  if (!cookies.tracking) {
    cookies.tracking = generateTrackingID();
    headers.set("Set-Cookie", `tracking=${cookies.tracking}`);
  }

  const redirect_host = new URL(process.env.NEXT_PUBLIC_REDIRECT_HOST!).host;
  const host = request.headers.get("host");

  if (host === redirect_host) {
    return NextResponse.rewrite(new URL("/api/slug", request.url), { headers });
  }
  return NextResponse.next({ headers });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
