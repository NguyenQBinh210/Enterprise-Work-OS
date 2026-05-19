import { createBrowserClient } from "@supabase/ssr";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  return browserClient;
}

export function resetSupabaseClient() {
  browserClient = null;
}

export function clearSupabaseAuthStorage() {
  if (typeof window === "undefined") return;

  Object.keys(window.localStorage)
    .filter((key) => key.startsWith("sb-") && key.includes("auth-token"))
    .forEach((key) => window.localStorage.removeItem(key));

  document.cookie
    .split(";")
    .map((cookie) => cookie.trim().split("=")[0])
    .filter((name) => name.startsWith("sb-") && name.includes("auth-token"))
    .forEach((name) => {
      document.cookie = `${name}=; Max-Age=0; path=/`;
    });
}
