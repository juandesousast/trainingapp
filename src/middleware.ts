import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Si faltan las variables en Edge, no lanzar throw fatal
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("VECTOR Middleware: Faltan variables de entorno de Supabase.");
    return response;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isAuthRoute = request.nextUrl.pathname.startsWith("/login");
    const isApiRoute = request.nextUrl.pathname.startsWith("/api");

    // Manejo de APIs no autorizadas
    if (isApiRoute && !user) {
      return NextResponse.json(
        { error: { message: "No autorizado. Sesión requerida." } },
        { status: 401 }
      );
    }

    // Redirección si no está autenticado y no es ruta pública/login
    if (!user && !isAuthRoute && !request.nextUrl.pathname.startsWith("/_next")) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Si ya está autenticado e intenta ir a login, enviar a inicio
    if (user && isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    return response;
  } catch (error) {
    console.error("VECTOR Middleware Exception:", error);
    // En caso de error inesperado, permitir el flujo sin tirar un 500
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)",
  ],
};
