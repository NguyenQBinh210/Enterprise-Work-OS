"use client";

import { uploadImage, deleteImage } from "@/actions/media.actions";
import { createNotification } from "@/actions/notification.actions";
import { createClient } from "@/lib/supabase/client";
import { readFileAsDataUrl, type ChatMessage, type ChatUser, type UserProfile } from "./messages.helpers";

function getPrivateMessageLink(chatUserId: string, messageId?: string) {
  const params = new URLSearchParams({ chat: chatUserId });
  if (messageId) params.set("message", messageId);
  return `/dashboard/messages?${params.toString()}`;
}

export async function loadCurrentChatUser(): Promise<ChatUser | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("Users")
    .select("*")
    .eq("Email", user.email)
    .single();

  return profile as ChatUser | null;
}

export async function loadChatUsers(currentUserId: string): Promise<ChatUser[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("Users")
    .select("*")
    .neq("Id", currentUserId);

  if (!data || data.length === 0) return [];

  const users = data as ChatUser[];
  const userIds = users.map((user) => user.Id);
  const { data: profiles } = await supabase
    .from("UserProfiles")
    .select("UserId, AvatarUrl")
    .in("UserId", userIds);

  return users.map((user) => {
    const profile = (profiles as UserProfile[] | null)?.find((item) => item.UserId === user.Id);
    return { ...user, AvatarUrl: profile?.AvatarUrl || null };
  });
}

export async function loadPrivateMessages(currentUserId: string, activeChatId: string): Promise<ChatMessage[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("PrivateMessages")
    .select("*")
    .or(`and(SenderId.eq.${currentUserId},ReceiverId.eq.${activeChatId}),and(SenderId.eq.${activeChatId},ReceiverId.eq.${currentUserId})`)
    .order("CreatedAt", { ascending: true });

  return (data || []) as ChatMessage[];
}

export async function insertPrivateMessage(message: ChatMessage, currentUser: ChatUser) {
  const supabase = createClient();

  await supabase.from("PrivateMessages").insert({
    Id: message.Id,
    SenderId: message.SenderId,
    ReceiverId: message.ReceiverId,
    Content: message.Content,
  });

  await createNotification({
    userId: message.ReceiverId,
    actorId: message.SenderId,
    type: "PRIVATE_MESSAGE",
    message: `${currentUser.FullName} đã nhắn: ${message.Content}`,
    link: getPrivateMessageLink(currentUser.Id, message.Id),
  });
}

export async function updatePrivateMessage(messageId: string, content: string) {
  const supabase = createClient();
  await supabase.from("PrivateMessages").update({ Content: content }).eq("Id", messageId);
}

export async function deletePrivateMessage(message: ChatMessage) {
  const supabase = createClient();

  if (message.Content.startsWith("[IMAGE]") || message.Content.startsWith("[FILE]")) {
    const parts = message.Content.split("]");
    const urlPart = parts[1]?.split("|")[0];
    if (urlPart) {
      try {
        await deleteImage(urlPart);
      } catch {
        // Deleting the database row is still the main action.
      }
    }
  }

  await supabase.from("PrivateMessages").delete().eq("Id", message.Id);

  await supabase
    .from("Notifications")
    .update({
      Message: "Tin nhắn này đã bị xóa.",
      Link: getPrivateMessageLink(message.SenderId),
    })
    .eq("UserId", message.ReceiverId)
    .eq("ActorId", message.SenderId)
    .eq("Type", "PRIVATE_MESSAGE")
    .eq("Link", getPrivateMessageLink(message.SenderId, message.Id));
}

export async function uploadChatWallpaper(file: File) {
  const base64 = await readFileAsDataUrl(file);
  const result = await uploadImage(base64, "chat_wallpapers");
  return result?.url || null;
}

export async function uploadChatFileMessage({
  file,
  messageId,
  currentUser,
  activeChatId,
}: {
  file: File;
  messageId: string;
  currentUser: ChatUser;
  activeChatId: string;
}) {
  const base64 = await readFileAsDataUrl(file);
  const result = await uploadImage(base64, "chat_files");

  if (!result?.url) return null;

  const isImage = file.type.startsWith("image/");
  const content = isImage ? `[IMAGE]${result.url}` : `[FILE]${result.url}|${file.name}`;
  const message: ChatMessage = {
    Id: messageId,
    SenderId: currentUser.Id,
    ReceiverId: activeChatId,
    Content: content,
    CreatedAt: new Date().toISOString(),
  };

  await createClient().from("PrivateMessages").insert({
    Id: message.Id,
    SenderId: message.SenderId,
    ReceiverId: message.ReceiverId,
    Content: message.Content,
  });

  await createNotification({
    userId: activeChatId,
    actorId: currentUser.Id,
    type: "PRIVATE_MESSAGE",
    message: isImage
      ? `${currentUser.FullName} đã gửi cho bạn một hình ảnh.`
      : `${currentUser.FullName} đã gửi cho bạn một tệp đính kèm.`,
    link: getPrivateMessageLink(currentUser.Id, message.Id),
  });

  return message;
}
