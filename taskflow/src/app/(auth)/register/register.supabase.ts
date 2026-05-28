"use client";

import { createClient } from "@/lib/supabase/client";

type RegisterParams = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

type RegisterResult = {
  success: boolean;
  error?: string;
};

export async function registerAccount({
  firstName,
  lastName,
  email,
  password,
}: RegisterParams): Promise<RegisterResult> {
  const supabase = createClient();
  const fullName = `${firstName} ${lastName}`.trim();

  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (signUpError) {
    return { success: false, error: signUpError.message };
  }

  const randomChars = Math.random().toString(36).substring(2, 6);
  const shortId = `usr_${randomChars}`;

  const { error: insertError } = await supabase.from("Users").insert({
    Id: shortId,
    Email: email,
    FullName: fullName,
    SystemRole: "USER",
  });

  if (insertError) {
    console.error("Lỗi khi đồng bộ hồ sơ:", insertError);
    return {
      success: false,
      error: "Lỗi đồng bộ hồ sơ. Bạn hãy kiểm tra xem đã TẮT tính năng 'Confirm Email' trên Supabase chưa nhé.",
    };
  }

  return { success: true };
}
