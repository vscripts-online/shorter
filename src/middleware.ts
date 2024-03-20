import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host");

  const redirect_host = new URL(process.env.NEXT_PUBLIC_REDIRECT_HOST!).host;

  if (host === redirect_host) {
    return NextResponse.rewrite(new URL("/api/slug", request.url));
  }
  return NextResponse.next();
}
