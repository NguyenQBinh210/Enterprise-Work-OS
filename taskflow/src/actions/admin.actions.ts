"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

// 1. Lấy danh sách người dùng
export async function getUsers() {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("Users")
    .select("*")
    .order("CreatedAt", { ascending: false });

  if (error) {
    console.error("Lỗi lấy danh sách user:", error.message);
    return [];
  }
  return data || [];
}

// 2. Cập nhật phân quyền tài khoản
export async function updateUserRole(userId: string, newRole: string) {
  const normalizedRole = newRole.toUpperCase();
  const allowedRoles = ["ADMIN", "MANAGER", "MEMBER", "VIEWER"];
  if (!allowedRoles.includes(normalizedRole)) {
    console.error("Vai trò không hợp lệ:", newRole);
    return false;
  }

  const supabase = await getSupabase();
  const { error } = await supabase
    .from("Users")
    .update({ SystemRole: normalizedRole })
    .eq("Id", userId);

  if (error) {
    console.error("Lỗi cập nhật quyền:", error.message);
    return false;
  }
  return true;
}

// 3. Lấy nhật ký hoạt động
export async function getUserLogs(userId: string) {
  try {
    console.log("Đang truy vấn log cho user:", userId);
    const supabase = await getSupabase();
    
    // Thử lấy log từ ActivityLogs
    const { data, error } = await supabase
      .from("ActivityLogs")
      .select("*")
      .eq("ActorId", userId)
      .order("CreatedAt", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Lỗi truy vấn ActivityLogs:", error.message);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error("Lỗi hệ thống khi lấy log:", err);
    return [];
  }
}

// 4. Ghi lại hoạt động mới
export async function logActivity(userId: string, action: string, details?: string) {
  const supabase = await getSupabase();
  const logId = "log_" + Math.random().toString(36).substring(2, 10);
  
  const { error } = await supabase.from("ActivityLogs").insert({
    Id: logId,
    ActorId: userId,
    Action: action,
    Details: details,
  });
  if (error) console.error("Lỗi ghi log:", error.message);
}

// 5. Cập nhật thông tin cá nhân (FullName)
export async function updateUserInfo(userId: string, fullName: string) {
  const supabase = await getSupabase();
  const { error } = await supabase
    .from("Users")
    .update({ FullName: fullName })
    .eq("Id", userId);

  if (error) {
    console.error("Lỗi cập nhật thông tin:", error.message);
    return { success: false, message: error.message };
  }
  return { success: true };
}

// 6. Đổi mật khẩu (Sử dụng Admin Auth API nếu có Service Role, hoặc mock/giả lập nếu demo)
export async function updateUserPassword(email: string, newPassword: string) {
  const supabase = await getSupabase();
  
  // Lưu ý: Để đổi mật khẩu người khác cần quyền Admin/Service Role trong Supabase
  const { error } = await supabase.auth.admin.updateUserById(
    (await supabase.from("Users").select("Id").eq("Email", email).single()).data?.Id, 
    { password: newPassword }
  );
  
  // Nếu không có service role, lệnh trên sẽ lỗi. 
  // Trong thực tế, admin thường gửi mail reset, nhưng ở đây tôi sẽ thực hiện theo yêu cầu UI.
  if (error) {
    console.error("Lỗi đổi mật khẩu:", error.message);
    return { success: false, message: "Cần quyền Service Role để đổi mật khẩu trực tiếp." };
  }
  return { success: true };
}

// 7. Vô hiệu hóa / Kích hoạt tài khoản
export async function toggleUserStatus(userId: string, isDisabled: boolean) {
  const supabase = await getSupabase();
  const { error } = await supabase
    .from("Users")
    .update({ IsDisabled: isDisabled })
    .eq("Id", userId);

  if (error) {
    console.error("Lỗi cập nhật trạng thái:", error.message);
    return { success: false, message: error.message };
  }
  return { success: true };
}
