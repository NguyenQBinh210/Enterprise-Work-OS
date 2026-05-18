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

export type CreateNotificationInput = {
  userId: string;
  message: string;
  type?: string;
  taskId?: string | null;
  groupId?: string | null;
  actorId?: string | null;
  link?: string | null;
};

export async function createNotification(input: CreateNotificationInput) {
  const supabase = await getSupabase();
  const notificationId = "noti_" + Math.random().toString(36).substring(2, 10);

  const payload: Record<string, string | boolean | null> = {
    Id: notificationId,
    UserId: input.userId,
    Message: input.message,
    IsRead: false,
  };

  if (input.type) payload.Type = input.type;
  if (input.taskId !== undefined) payload.TaskId = input.taskId;
  if (input.groupId !== undefined) payload.GroupId = input.groupId;
  if (input.actorId !== undefined) payload.ActorId = input.actorId;
  if (input.link !== undefined) payload.Link = input.link;

  const { error } = await supabase.from("Notifications").insert(payload);
  if (error) {
    console.error("Cannot create notification:", error.message);
    return { success: false, message: error.message };
  }

  return { success: true };
}
