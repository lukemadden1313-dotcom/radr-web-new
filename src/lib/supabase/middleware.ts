// Supabase middleware client. Keys come from .env.local — see docs/handoff-to-luke.md for backend details.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that don't require authentication.
const PUBLIC_ROUTES = [
  "/",
  "/sign-in",
  "/auth/callback",
];

// Path prefixes that are always public (share pages, legal, OG images).
const PUBLIC_PREFIXES = [
  "/w/",
  "/w-v2/",
  "/g/",
  "/g-v2/",
  "/u/",
];

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  // Static HTML files (terms, privacy, cookies)
  if (pathname.endsWith(".html")) return true;
  return false;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh the session — this keeps the auth token alive.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthenticated visitors to /sign-in (unless on a public route).
  const { pathname } = request.nextUrl;
  if (!user && !isPublicRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
