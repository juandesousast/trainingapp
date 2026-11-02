import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

// Crea el cliente para el navegador o prerenderizado
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Validación en tiempo de ejecución solo en el cliente real
if (typeof window !== "undefined") {
  const isMissingEnv =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (isMissingEnv) {
    console.error(
      "⚠️ VECTOR OS Config Error: NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY no están configuradas en el entorno."
    );
  }
}
