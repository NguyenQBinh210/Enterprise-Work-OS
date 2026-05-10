"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Hàm helper để tạo Supabase Client trong Server Actions
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

// Lấy danh sách thành viên trong dự án
export async function getProjectMembers(groupId: string) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("GroupMembers")
    .select("Role, UserId, Users:UserId(Id, FullName, Email)")
    .eq("GroupId", groupId);

  if (error) {
    console.error("Lỗi lấy thành viên dự án:", error.message);
    return [];
  }

  if (data && data.length > 0) {
    const userIds = data.map((m: any) => m.UserId);
    const { data: profiles } = await supabase
        .from('UserProfiles')
        .select('UserId, AvatarUrl')
        .in('UserId', userIds);
    
    return data.map((m: any) => {
        const profile = profiles?.find(p => p.UserId === m.UserId);
        return {
            Role: m.Role,
            user: {
                ...m.Users,
                AvatarUrl: profile?.AvatarUrl || null
            }
        };
    });
  }

  return [];
}

// Mời người dùng vào dự án
export async function inviteMember(groupId: string, email: string) {
  const supabase = await getSupabase();
  
  const { data: user, error: findError } = await supabase
    .from("Users")
    .select("Id")
    .eq("Email", email)
    .single();

  if (findError || !user) {
    return { success: false, message: "Không tìm thấy tài khoản có email này!" };
  }
  
  const { data: existing } = await supabase
    .from("GroupMembers")
    .select("*")
    .eq("GroupId", groupId)
    .eq("UserId", user.Id)
    .single();

  if (existing) {
    return { success: false, message: "Người này đã ở trong dự án rồi!" };
  }

  const { error } = await supabase.from("GroupMembers").insert({
    GroupId: groupId,
    UserId: user.Id,
    Role: "MEMBER"
  });

  if (error) {
    return { success: false, message: "Lỗi khi thêm thành viên: " + error.message };
  }

  return { success: true, message: "Mời thành công!" };
}

// Tìm kiếm người dùng theo tên hoặc email
export async function searchUsers(query: string) {
  if (!query || query.length < 2) return [];
  const supabase = await getSupabase();
  
  const { data, error } = await supabase
    .from("Users")
    .select("Id, FullName, Email")
    .or(`FullName.ilike.%${query}%,Email.ilike.%${query}%`)
    .limit(5);

  if (error) return [];
  return data;
}

// Mời người dùng vào dự án theo ID (dùng cho autocomplete)
export async function inviteMemberById(groupId: string, userId: string) {
  const supabase = await getSupabase();

  // Kiểm tra xem đã có trong dự án chưa
  const { data: existing } = await supabase
    .from("GroupMembers")
    .select("*")
    .eq("GroupId", groupId)
    .eq("UserId", userId)
    .single();

  if (existing) {
    return { success: false, message: "Người này đã ở trong dự án rồi!" };
  }

  const { error } = await supabase.from("GroupMembers").insert({
    GroupId: groupId,
    UserId: userId,
    Role: "MEMBER"
  });

  if (error) {
    return { success: false, message: "Lỗi: " + error.message };
  }

  return { success: true, message: "Đã thêm vào dự án!" };
}


// Tạo dự án mới
export async function createProject(name: string, description: string, creatorId: string) {
  const supabase = await getSupabase();
  const groupId = "proj_" + Math.random().toString(36).substring(2, 10);

  const { data: group, error: groupError } = await supabase
    .from("Groups")
    .insert({
      Id: groupId,
      Name: name,
      Description: description,
      CreatedBy: creatorId
    })
    .select()
    .single();

  if (groupError) {
    return { success: false, message: groupError.message };
  }

  // Thêm người tạo vào GroupMembers
  await supabase.from("GroupMembers").insert({
    GroupId: groupId,
    UserId: creatorId,
    Role: "OWNER"
  });

  return { success: true, data: group };
}

// Cập nhật dự án
export async function updateProject(groupId: string, name: string, description: string) {
  const supabase = await getSupabase();
  const { error } = await supabase
    .from("Groups")
    .update({ Name: name, Description: description })
    .eq("Id", groupId);

  if (error) {
    return { success: false, message: error.message };
  }
  return { success: true };
}

// Xóa dự án
export async function deleteProject(groupId: string) {
  const supabase = await getSupabase();
  const { error } = await supabase
    .from("Groups")
    .delete()
    .eq("Id", groupId);

  if (error) {
    return { success: false, message: error.message };
  }
  return { success: true };
}

// Lấy quyền của tôi trong dự án
export async function getMyProjectRole(groupId: string, userId: string) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("GroupMembers")
    .select("Role")
    .eq("GroupId", groupId)
    .eq("UserId", userId)
    .single();

  if (error || !data) return "VIEWER";
  return data.Role;
}
