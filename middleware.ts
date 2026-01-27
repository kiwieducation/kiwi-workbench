import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 临时验证版：不做任何鉴权，不调用 Supabase
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

