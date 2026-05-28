"use client";

import { uploadImage, deleteImage } from "@/actions/media.actions";
import { createClient } from "@/lib/supabase/client";

export type ProfileUser = {
  Id: string;
  Email: string;
  FullName?: string | null;
  SystemRole?: string | null;
};

export type ProfileValues = {
  fullName: string;
  avatarUrl: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  bio: string;
  department: string;
};

type LoadedProfile = {
  user: ProfileUser | null;
  values: ProfileValues;
};

const emptyProfileValues: ProfileValues = {
  fullName: "",
  avatarUrl: "",
  phoneNumber: "",
  dateOfBirth: "",
  gender: "",
  address: "",
  bio: "",
  department: "",
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Đã xảy ra lỗi";
}

function formatDateForDisplay(value?: string | null) {
  if (!value) return "";

  const [datePart] = value.split("T");
  const parts = datePart.split("-");
  if (parts.length !== 3) return value;

  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

function normalizeDateForDatabase(value: string) {
  if (!value) return null;

  const parts = value.split("/");
  if (parts.length !== 3) return value;

  const [day, month, year] = parts;
  if (!day || !month || !year) return value;

  return `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Không thể đọc file ảnh."));
    reader.readAsDataURL(file);
  });
}

export async function loadProfile(): Promise<LoadedProfile> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    return { user: null, values: emptyProfileValues };
  }

  const { data: userData } = await supabase
    .from("Users")
    .select("*")
    .eq("Email", session.user.email)
    .single();

  if (!userData) {
    return { user: null, values: emptyProfileValues };
  }

  const user = userData as ProfileUser;
  const values = {
    ...emptyProfileValues,
    fullName: user.FullName || "",
  };

  const { data: profileData } = await supabase
    .from("UserProfiles")
    .select("*")
    .eq("UserId", user.Id)
    .maybeSingle();

  if (!profileData) {
    return { user, values };
  }

  return {
    user,
    values: {
      fullName: values.fullName,
      avatarUrl: profileData.AvatarUrl || "",
      phoneNumber: profileData.PhoneNumber || "",
      dateOfBirth: formatDateForDisplay(profileData.DateOfBirth),
      gender: profileData.Gender || "",
      address: profileData.Address || "",
      bio: profileData.Bio || "",
      department: profileData.Department || "",
    },
  };
}

export async function saveProfile(userId: string, values: ProfileValues) {
  const supabase = createClient();

  const { error: userError } = await supabase
    .from("Users")
    .update({ FullName: values.fullName })
    .eq("Id", userId);

  if (userError) throw userError;

  const profilePayload = {
    UserId: userId,
    AvatarUrl: values.avatarUrl,
    PhoneNumber: values.phoneNumber,
    DateOfBirth: normalizeDateForDatabase(values.dateOfBirth),
    Gender: values.gender,
    Address: values.address,
    Bio: values.bio,
    Department: values.department,
    UpdatedAt: new Date().toISOString(),
  };

  const { data: existingProfile } = await supabase
    .from("UserProfiles")
    .select("UserId")
    .eq("UserId", userId)
    .maybeSingle();

  if (existingProfile) {
    const { error: profileError } = await supabase
      .from("UserProfiles")
      .update(profilePayload)
      .eq("UserId", userId);
    if (profileError) throw profileError;
    return;
  }

  const { error: profileError } = await supabase
    .from("UserProfiles")
    .insert(profilePayload);
  if (profileError) throw profileError;
}

export async function uploadProfileAvatar(file: File, userId: string) {
  if (file.size > 1 * 1024 * 1024) {
    throw new Error("Ảnh quá nặng! Vui lòng chọn ảnh dưới 1MB.");
  }

  const supabase = createClient();
  const base64data = await readFileAsDataUrl(file);
  const result = await uploadImage(base64data, "avatars");

  if (!result?.url) {
    throw new Error("Không nhận được đường dẫn ảnh sau khi tải lên.");
  }

  const { error } = await supabase
    .from("UserProfiles")
    .update({ AvatarUrl: result.url, UpdatedAt: new Date().toISOString() })
    .eq("UserId", userId);

  if (error) throw error;

  return result.url;
}

export async function removeProfileAvatar(avatarUrl: string, userId: string) {
  const supabase = createClient();

  await deleteImage(avatarUrl);

  const { error } = await supabase
    .from("UserProfiles")
    .update({ AvatarUrl: "", UpdatedAt: new Date().toISOString() })
    .eq("UserId", userId);

  if (error) throw error;
}

export async function deleteProfileAccount(userId: string) {
  const supabase = createClient();

  const { error } = await supabase.from("Users").delete().eq("Id", userId);
  if (error) throw error;

  await supabase.auth.signOut();
}

export { getErrorMessage };
