"use client";

import { logActivity } from "@/actions/admin.actions";
import { clearSupabaseAuthStorage, createClient, resetSupabaseClient } from "@/lib/supabase/client";

type LoginResult = {
  success: boolean;
  error?: string;
};

function withTimeout<T>(promise: Promise<T>, ms: number, message: string) {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      window.setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
}

export async function loginWithEmailPassword(email: string, password: string): Promise<LoginResult> {
  clearSupabaseAuthStorage();
  resetSupabaseClient();
  const supabase = createClient();
  try {
    const loginResult = await withTimeout(
      supabase.auth.signInWithPassword({ email, password }),
      15000,
      "Đăng nhập quá lâu, vui lòng thử lại."
    ) as Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>;

    if (loginResult.error) {
      return { success: false, error: loginResult.error.message };
    }
    try {
      const userResult = await withTimeout(
        supabase
          .from("Users")
          .select("Id, IsDisabled")
          .eq("Email", email)
          .single(),
        10000,
        "Không thể kiểm tra tài khoản. Vui lòng thử lại."
      ) as { data: { Id: string; IsDisabled?: boolean | null } | null };
      const userData = userResult.data;

      if (userData?.IsDisabled) {
        await supabase.auth.signOut();
        return {
          success: false,
          error: "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.",
        };
      }

      if (userData) {
        logActivity(userData.Id, "Đăng nhập hệ thống", "Truy cập từ trình duyệt").catch((logError) => {
          console.error("Không thể ghi nhật ký đăng nhập:", logError);
        });
      }
    } catch (profileError) {
      console.error("Lỗi kiểm tra trạng thái tài khoản:", profileError);
    }

    return { success: true };
  } catch (loginError) {
    const message = loginError instanceof Error ? loginError.message : "Không thể đăng nhập. Vui lòng thử lại.";
    return { success: false, error: message };
  }
}
