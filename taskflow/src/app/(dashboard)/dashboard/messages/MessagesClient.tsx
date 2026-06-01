'use client';

import { Suspense, useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    Search, Plus, MoreVertical, Mic, Smile, Paperclip, Send, Check, CheckCheck,
    ArrowLeft, ImageIcon, X, Loader2, Trash2, Pencil
} from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { AppImage } from '@/components/ui/AppImage';
import {
    createCustomWallpaper,
    createMessageId,
    getStoredWallpaper,
    playNotificationSound,
    storeWallpaper,
    type ChatMessage,
    type ChatWallpaper,
} from './messages.helpers';
import {
    deletePrivateMessage,
    insertPrivateMessage,
    loadChatUsers,
    loadCurrentChatUser,
    loadPrivateMessages,
    updatePrivateMessage,
    uploadChatFileMessage,
    uploadChatWallpaper,
} from './messages.supabase';

const WALLPAPER_PRESETS: ChatWallpaper[] = [
    { id: 'default', label: 'Máº·c Ä‘á»‹nh', style: { backgroundColor: '#f8fafc', backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '20px 20px' } },
    { id: 'indigo', label: 'Indigo', style: { background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)' } },
    { id: 'rose', label: 'Rose', style: { background: 'linear-gradient(135deg, #fff1f2 0%, #fdf4ff 100%)' } },
    { id: 'emerald', label: 'Emerald', style: { background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)' } },
    { id: 'amber', label: 'Amber', style: { background: 'linear-gradient(135deg, #fffbeb 0%, #fef9c3 100%)' } },
    { id: 'slate', label: 'Slate Dark', style: { background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' } },
    { id: 'ocean', label: 'Ocean', style: { background: 'linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%)' } },
    { id: 'aurora', label: 'Aurora', style: { background: 'linear-gradient(135deg, #fae8ff 0%, #dbeafe 50%, #dcfce7 100%)' } },
];

type ChatUser = {
    Id: string;
    FullName: string;
    Email?: string | null;
    AvatarUrl?: string | null;
};

export default function MessagesClient() {
    return (
        <Suspense fallback={<div className="p-8 text-sm font-semibold text-slate-400">Äang táº£i tin nháº¯n...</div>}>
            <MessagesPageContent />
        </Suspense>
    );
}

function MessagesPageContent() {
    const supabase = createClient();
    const searchParams = useSearchParams();

    const [currentUser, setCurrentUser] = useState<ChatUser | null>(null);
    const [users, setUsers] = useState<ChatUser[]>([]);
    const [activeChat, setActiveChat] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const wallpaperInputRef = useRef<HTMLInputElement>(null);
    const chatImageInputRef = useRef<HTMLInputElement>(null);

    // Wallpaper state
    const [showWallpaperPanel, setShowWallpaperPanel] = useState(false);
    const [wallpaper, setWallpaper] = useState<ChatWallpaper>(WALLPAPER_PRESETS[0]);
    const [uploadingWallpaper, setUploadingWallpaper] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const requestedChatId = searchParams.get('chat');

    // Load wallpaper from localStorage when chat changes
    useEffect(() => {
        if (!activeChat) return;
        const loadedWallpaper = getStoredWallpaper(activeChat);
        window.setTimeout(() => setWallpaper(loadedWallpaper), 0);
    }, [activeChat]);

    const saveWallpaper = (wp: ChatWallpaper) => {
        if (!activeChat) return;
        setWallpaper(wp);
        storeWallpaper(activeChat, wp);
        setShowWallpaperPanel(false);
    };

    const handleWallpaperImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 3 * 1024 * 1024) { toast.error("Ảnh quá nặng! Vui lòng chọn ảnh dưới 3MB."); return; }
        setUploadingWallpaper(true);
        try {
            const url = await uploadChatWallpaper(file);
            if (url) {
                saveWallpaper(createCustomWallpaper(url));
            }
        } catch {
            toast.error('Không thể tải ảnh lên. Vui lòng thử lại.');
        } finally {
            setUploadingWallpaper(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentUser || !activeChat) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File quá nặng! Vui lòng chọn file dưới 5MB.");
            return;
        }

        setUploadingImage(true);
        try {
            const message = await uploadChatFileMessage({
                file,
                messageId: createMessageId(),
                currentUser,
                activeChatId: activeChat,
            });
            if (message) {
                setMessages(prev => [...prev, message]);
            }
        } catch {
            toast.error("Không thể gửi tin nhắn với file dính kèm.");
        } finally {
            setUploadingImage(false);
            if (chatImageInputRef.current) chatImageInputRef.current.value = '';
        }
    };
    useEffect(() => {
        const fetchUser = async () => {
            const profile = await loadCurrentChatUser();
            setCurrentUser(profile);
        };
        fetchUser();
    }, []);

    useEffect(() => {
        if (!currentUser) return;
        const fetchUsers = async () => {
            const usersWithAvatars = await loadChatUsers(currentUser.Id);
            if (usersWithAvatars.length > 0) {
                setUsers(usersWithAvatars);
                if (requestedChatId && usersWithAvatars.some((u: ChatUser) => u.Id === requestedChatId)) {
                    setActiveChat(requestedChatId);
                } else if (!activeChat && typeof window !== 'undefined' && window.innerWidth >= 1024) {
                    setActiveChat(usersWithAvatars[0].Id);
                }
            } else {
                setUsers([]);
            }
        };
        fetchUsers();
    }, [currentUser, requestedChatId, activeChat]);
    // 3. Real-time Messages
    useEffect(() => {
        if (!currentUser || !activeChat) return;

        const fetchMessages = async () => {
            const data = await loadPrivateMessages(currentUser.Id, activeChat);
            setMessages(data);
        };
        fetchMessages();

        const channel = supabase.channel(`chat:${activeChat}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'PrivateMessages'
            }, (payload: { eventType: string; new: unknown; old: unknown }) => {
                if (payload.eventType === 'INSERT') {
                    const newMsg = payload.new as ChatMessage;
                    if (newMsg.ReceiverId === currentUser.Id) playNotificationSound();
                    if ((newMsg.SenderId === currentUser.Id && newMsg.ReceiverId === activeChat) || (newMsg.SenderId === activeChat && newMsg.ReceiverId === currentUser.Id)) {
                        setMessages((prev) => {
                            if (prev.some(m => m.Id === newMsg.Id)) return prev;
                            return [...prev, newMsg];
                        });
                    }
                }
                if (payload.eventType === 'UPDATE') {
                    const updatedMsg = payload.new as ChatMessage;
                    setMessages(prev => prev.map(m => m.Id === updatedMsg.Id ? updatedMsg : m));
                }
                if (payload.eventType === 'DELETE') {
                    const deletedMsg = payload.old as Partial<ChatMessage>;
                    setMessages(prev => prev.filter(m => m.Id !== deletedMsg.Id));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUser, activeChat, supabase]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || !currentUser || !activeChat) return;

        const text = inputValue;
        setInputValue('');
        const newMsgId = createMessageId();

        const optimisticMsg: ChatMessage = {
            Id: newMsgId,
            SenderId: currentUser.Id,
            ReceiverId: activeChat,
            Content: text,
            CreatedAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisticMsg]);

        await insertPrivateMessage(optimisticMsg, currentUser);

    };

    const handleDeleteMessage = async (msgId: string) => {
        const msg = messages.find(m => m.Id === msgId);
        if (!msg) return;

        // 1. XÃ³a khá»i giao diá»‡n ngay láº­p tá»©c (Cá»±c mÆ°á»£t)
        setMessages(prev => prev.filter(m => m.Id !== msgId));
        toast.success("ÄÃ£ xÃ³a tin nháº¯n");

        // 2. Xá»­ lÃ½ ngáº§m (Background)
        await deletePrivateMessage(msg);
    };

    const handleUpdateMessage = async (e: React.FormEvent, msgId: string) => {
        e.preventDefault();
        if (!editValue.trim()) return;
        setMessages(prev => prev.map(m => m.Id === msgId ? { ...m, Content: editValue } : m));
        setEditingMessageId(null);
        await updatePrivateMessage(msgId, editValue);
    };

    if (!currentUser) {
        return (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-slate-400 font-medium text-lg">
              Đang tải tin nhắn ...
            </div>
          </div>
        );
    }

    const activeUserObj = users.find(u => u.Id === activeChat);
    const filteredUsers = searchQuery.trim()
        ? users.filter(u => u.FullName?.toLowerCase().includes(searchQuery.toLowerCase()) || u.Email?.toLowerCase().includes(searchQuery.toLowerCase()))
        : users;

    return (
      <div className="flex h-[calc(100vh-4rem)] w-full bg-white animate-slide-up relative overflow-hidden">
        {/* LEFT SIDEBAR (Chat List) */}
        <div
          className={`
                absolute inset-0 lg:relative lg:inset-auto z-20
                w-full lg:w-90 
                bg-white lg:border-r lg:border-slate-100
                flex flex-col overflow-hidden 
                transition-all duration-300 ease-in-out
                ${activeChat ? "-translate-x-full lg:translate-x-0 opacity-0 lg:opacity-100" : "translate-x-0 opacity-100"}
                shrink-0
            `}
        >
          {/* Header & Search */}
          <div className="p-4 lg:p-6 pb-2">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h2 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight">
                Messages
              </h2>
              <div className="flex gap-1 lg:gap-2">
                <button className="p-2 lg:p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95">
                  <Plus size={20} />
                </button>
                <button className="p-2 lg:p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            <div className="relative group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                size={18}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm trong tin nhắn..."
                className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-transparent focus:border-indigo-100 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Recent Chats (Horizontal) â€” áº©n khi Ä‘ang search */}
          {!searchQuery && (
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-bold text-slate-800 text-sm">Gần đây</h3>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                {users.slice(0, 5).map((u) => (
                  <button
                    key={u.Id}
                    onClick={() => setActiveChat(u.Id)}
                    className="flex flex-col items-center gap-2 shrink-0"
                  >
                    <div className="relative">
                      <div
                        className={`w-14 h-14 rounded-full border-2 border-white shadow-md flex items-center justify-center font-bold text-lg transition-all overflow-hidden ${
                          activeChat === u.Id
                            ? "bg-indigo-600 text-white"
                            : "bg-linear-to-tr from-slate-200 to-slate-100 text-slate-600"
                        }`}
                      >
                        {u.AvatarUrl ? (
                          <AppImage
                            src={u.AvatarUrl}
                            alt={u.FullName}
                            fill
                            className="w-full h-full"
                            imageClassName="object-cover"
                            sizes="56px"
                          />
                        ) : (
                          u.FullName.charAt(0)
                        )}
                      </div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 max-w-14 truncate">
                      {u.FullName.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* All Chats (Vertical) */}
          <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-1">
            <div className="flex items-center justify-between px-3 mb-2">
              <h3 className="font-bold text-slate-800 text-sm">
                {searchQuery ? `Kết quả (${filteredUsers.length})` : "Tất cả"}
              </h3>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <Search
                  size={32}
                  strokeWidth={1.5}
                  className="mb-3 text-slate-300"
                />
                <p className="text-sm font-bold text-slate-400">
                  Không tìm thấy
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  &ldquo;{searchQuery}&rdquo;
                </p>
              </div>
            ) : (
              filteredUsers.map((u) => (
                <button
                  key={u.Id}
                  onClick={() => {
                    setActiveChat(u.Id);
                    setSearchQuery("");
                  }}
                  className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all group ${
                    activeChat === u.Id
                      ? "bg-indigo-50/50 ring-1 ring-indigo-100"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="relative shrink-0">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg overflow-hidden ${
                        activeChat === u.Id
                          ? "bg-indigo-600"
                          : "bg-linear-to-br from-slate-400 to-slate-500"
                      }`}
                    >
                      {u.AvatarUrl ? (
                        <AppImage
                          src={u.AvatarUrl}
                          alt={u.FullName}
                          fill
                          className="w-full h-full"
                          imageClassName="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        u.FullName.charAt(0)
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-bold text-slate-800 truncate text-sm">
                      {u.FullName}
                    </p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {u.Email}
                    </p>
                  </div>
                  {activeChat === u.Id && (
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* MAIN CHAT WINDOW */}
        <div
          className={`
                absolute inset-0 lg:relative lg:inset-auto z-10
                flex-1 bg-white
                flex flex-col overflow-hidden 
                transition-all duration-300 ease-in-out
                ${activeChat ? "translate-x-0 opacity-100" : "translate-x-full lg:translate-x-0 opacity-0 lg:opacity-100"}
                relative
            `}
        >
          {/* Dynamic Wallpaper */}
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-500"
            style={wallpaper.style || {}}
          />

          {activeUserObj ? (
            <>
              {/* Header */}
              <div className="h-16 lg:h-20 px-4 lg:px-8 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-slate-100 shrink-0 z-20 relative">
                <div className="flex items-center gap-3 lg:gap-4">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setActiveChat(null)}
                    className="p-2 lg:hidden text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <ArrowLeft size={20} />
                  </button>

                  <div className="relative">
                    <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 shadow-sm overflow-hidden">
                      {activeUserObj.AvatarUrl ? (
                        <AppImage
                          src={activeUserObj.AvatarUrl}
                          alt={activeUserObj.FullName}
                          fill
                          className="w-full h-full"
                          imageClassName="object-cover"
                          sizes="44px"
                        />
                      ) : (
                        activeUserObj.FullName.charAt(0)
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 lg:w-3.5 lg:h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-bold lg:font-black text-slate-800 leading-tight text-sm lg:text-base">
                      {activeUserObj.FullName}
                    </h3>
                    <p className="text-[10px] lg:text-[11px] font-bold text-emerald-500">
                      Đang hoạt động
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 lg:gap-2">
                  <button className="p-2 lg:p-2.5 text-slate-400 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all hidden sm:block">
                    <Search size={20} />
                  </button>
                  {/* Wallpaper Button */}
                  <button
                    onClick={() => setShowWallpaperPanel((v) => !v)}
                    className={`p-2 lg:p-2.5 rounded-xl transition-all ${showWallpaperPanel ? "bg-indigo-100 text-indigo-600" : "text-slate-400 hover:bg-slate-50 hover:text-indigo-600"}`}
                    title="Äá»•i hÃ¬nh ná»n"
                  >
                    <ImageIcon size={20} />
                  </button>
                  <button className="p-2 lg:p-2.5 text-slate-400 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all">
                    <MoreVertical size={20} />
                  </button>
                </div>

                {/* Wallpaper Panel Dropdown */}
                {showWallpaperPanel && (
                  <div className="absolute top-full right-4 mt-2 w-80 bg-white rounded-2xl shadow-2xl shadow-slate-200/60 border border-slate-100 z-50 overflow-hidden animate-slide-up">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                      <div>
                        <p className="font-black text-slate-800 text-sm">
                          HÃ¬nh ná»n trÃ² chuyá»‡n
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Chá»n preset hoáº·c táº£i áº£nh lÃªn
                        </p>
                      </div>
                      <button
                        onClick={() => setShowWallpaperPanel(false)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Preset Grid */}
                    <div className="p-4 grid grid-cols-4 gap-2">
                      {WALLPAPER_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => saveWallpaper(preset)}
                          className={`relative h-14 rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${wallpaper.id === preset.id ? "border-indigo-500 shadow-lg shadow-indigo-200" : "border-transparent"}`}
                          style={preset.style}
                          title={preset.label}
                        >
                          {wallpaper.id === preset.id && (
                            <div className="absolute inset-0 flex items-center justify-center bg-indigo-500/20">
                              <div className="w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                                <Check size={10} className="text-white" />
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    <p className="px-4 text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">
                      Preset
                    </p>
                    <div className="px-4 pb-4 grid grid-cols-4 gap-1.5">
                      {WALLPAPER_PRESETS.map((p) => (
                        <span
                          key={p.id}
                          className="text-[9px] text-center text-slate-400 truncate"
                        >
                          {p.label}
                        </span>
                      ))}
                    </div>

                    {/* Upload Custom */}
                    <div className="px-4 pb-4 border-t border-slate-50 pt-3">
                      <input
                        ref={wallpaperInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleWallpaperImageUpload}
                      />
                      <button
                        onClick={() => wallpaperInputRef.current?.click()}
                        disabled={uploadingWallpaper}
                        className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 rounded-xl text-xs font-bold text-slate-500 hover:text-indigo-600 transition-all"
                      >
                        {uploadingWallpaper ? (
                          <>
                            <Loader2 size={14} className="animate-spin" /> Đang
                            tải lên...
                          </>
                        ) : (
                          <>
                            <ImageIcon size={14} /> Tải ảnh từ máy tính
                          </>
                        )}
                      </button>
                      {wallpaper.id === "custom" && wallpaper.url && (
                        <div className="mt-2 flex items-center gap-2 p-2 bg-slate-50 rounded-xl">
                          <AppImage
                            src={wallpaper.url}
                            alt="Custom wallpaper"
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-700 truncate">
                              áº¢nh tÃ¹y chá»‰nh
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Äang sá»­ dá»¥ng
                            </p>
                          </div>
                          <button
                            onClick={() => saveWallpaper(WALLPAPER_PRESETS[0])}
                            className="p-1 text-slate-400 hover:text-red-500"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Message Area */}
              <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-4 lg:space-y-8 z-10 scrollbar-none">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-50">
                    <Smile size={64} strokeWidth={1} className="mb-4" />
                    <p className="text-sm font-medium">
                      Bắt đầu cuộc trò truyện mới
                    </p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = msg.SenderId === currentUser.Id;
                    const isConsecutive =
                      index > 0 &&
                      messages[index - 1].SenderId === msg.SenderId;

                    return (
                      <div
                        key={msg.Id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        {!isConsecutive && (
                          <div
                            className={`flex items-center gap-2 mb-2 ${isMe ? "flex-row-reverse" : ""}`}
                          >
                            <span className="text-[13px] font-black text-slate-800">
                              {isMe ? "You" : activeUserObj.FullName}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              {new Date(msg.CreatedAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {isMe && (
                              <CheckCheck
                                size={14}
                                className="text-indigo-500"
                              />
                            )}
                          </div>
                        )}

                        <div className="flex items-end gap-3 max-w-[80%] group">
                          {!isMe && !isConsecutive && (
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-500 shrink-0 overflow-hidden">
                              {activeUserObj.AvatarUrl ? (
                                <AppImage
                                  src={activeUserObj.AvatarUrl}
                                  alt={activeUserObj.FullName}
                                  fill
                                  className="w-full h-full"
                                  imageClassName="object-cover"
                                  sizes="32px"
                                />
                              ) : (
                                activeUserObj.FullName.charAt(0)
                              )}
                            </div>
                          )}
                          {!isMe && isConsecutive && (
                            <div className="w-8 shrink-0" />
                          )}

                          <div className="relative">
                            {(() => {
                              const isImg = msg.Content?.startsWith("[IMAGE]");
                              const isFile = msg.Content?.startsWith("[FILE]");

                              if (isImg) {
                                const imgUrl = msg.Content.replace(
                                  "[IMAGE]",
                                  "",
                                );
                                return (
                                  <div className="p-1 bg-indigo-50/50 rounded-3xl overflow-hidden shadow-sm">
                                    <AppImage
                                      src={imgUrl}
                                      alt="attached image"
                                      width={280}
                                      height={300}
                                      className="max-w-50 md:max-w-75 max-h-75 rounded-[1.25rem] object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                      onClick={() =>
                                        window.open(imgUrl, "_blank")
                                      }
                                    />
                                  </div>
                                );
                              }

                              if (isFile) {
                                const fileData = msg.Content.replace(
                                  "[FILE]",
                                  "",
                                ).split("|");
                                const fileUrl = fileData[0];
                                const fileName = fileData[1] || "document.pdf";
                                const downloadUrl = fileUrl.replace(
                                  "/upload/",
                                  "/upload/fl_attachment/",
                                );

                                return (
                                  <div
                                    className={`px-5 py-4 flex items-center gap-4 rounded-2xl border shadow-sm transition-all hover:shadow-md ${
                                      isMe
                                        ? "bg-indigo-700 border-indigo-800 text-white"
                                        : "bg-white border-slate-200 text-slate-800"
                                    }`}
                                  >
                                    <div
                                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                                        isMe
                                          ? "bg-indigo-600"
                                          : "bg-slate-100 text-slate-500"
                                      }`}
                                    >
                                      <Paperclip size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0 pr-4">
                                      <p className="text-sm font-bold truncate leading-tight mb-1">
                                        {fileName}
                                      </p>
                                      <p
                                        className={`text-[10px] font-black uppercase tracking-widest ${isMe ? "text-indigo-300" : "text-slate-400"}`}
                                      >
                                        TÃ i liá»‡u Ä‘Ã­nh kÃ¨m
                                      </p>
                                    </div>
                                    <a
                                      href={downloadUrl}
                                      download={fileName}
                                      className={`p-2.5 rounded-xl transition-all active:scale-90 ${
                                        isMe
                                          ? "bg-white/10 hover:bg-white/20 text-white"
                                          : "bg-indigo-50 hover:bg-indigo-100 text-indigo-600"
                                      }`}
                                      title="Táº£i vá»"
                                    >
                                      <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2.5}
                                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                        />
                                      </svg>
                                    </a>
                                  </div>
                                );
                              }

                              return (
                                <div
                                  className={`${isMe ? "bg-indigo-600 text-white shadow-indigo-100" : "bg-white text-slate-700 border border-slate-100"} px-5 py-3.5 text-[15px] font-medium shadow-sm transition-all rounded-3xl ${isMe ? "rounded-tr-sm" : "rounded-tl-sm"}`}
                                >
                                  {editingMessageId === msg.Id ? (
                                    <form
                                      onSubmit={(e) =>
                                        handleUpdateMessage(e, msg.Id)
                                      }
                                      className="flex items-center gap-1.5"
                                    >
                                      <input
                                        type="text"
                                        value={editValue}
                                        onChange={(e) =>
                                          setEditValue(e.target.value)
                                        }
                                        className="px-2.5 py-1 text-slate-800 bg-white/90 rounded-lg text-[14px] outline-none min-w-37.5 border border-white focus:ring-2 focus:ring-white/50 transition-all shadow-inner"
                                        autoFocus
                                      />
                                      <button
                                        type="submit"
                                        className="p-1.5 text-white hover:bg-white/20 rounded-md transition-colors"
                                        title="LÆ°u"
                                      >
                                        <Check size={14} strokeWidth={3} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setEditingMessageId(null)
                                        }
                                        className="p-1.5 text-white hover:bg-white/20 rounded-md transition-colors"
                                        title="Há»§y"
                                      >
                                        <X size={14} strokeWidth={3} />
                                      </button>
                                    </form>
                                  ) : (
                                    msg.Content
                                  )}
                                </div>
                              );
                            })()}
                          </div>

                          {isMe && (
                            <div className="hidden group-hover:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!msg.Content?.startsWith("[IMAGE]") &&
                                !msg.Content?.startsWith("[FILE]") && (
                                  <button
                                    onClick={() => {
                                      setEditingMessageId(msg.Id);
                                      setEditValue(msg.Content);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg"
                                    title="Sá»­a tin nháº¯n"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                )}
                              <button
                                onClick={() => handleDeleteMessage(msg.Id)}
                                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg"
                                title="XÃ³a tin nháº¯n"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 lg:p-6 bg-white/80 backdrop-blur-md border-t border-slate-100 z-20">
                <form
                  onSubmit={handleSendMessage}
                  className="flex items-center gap-2 lg:gap-3 bg-slate-50 p-1.5 lg:p-2 pl-4 lg:pl-5 rounded-3xl lg:rounded-2xl border border-slate-100 focus-within:ring-4 focus-within:ring-indigo-50/50 focus-within:bg-white transition-all"
                >
                  <button
                    type="button"
                    className="text-slate-400 hover:text-indigo-600 transition-colors hidden sm:block"
                  >
                    <Mic size={20} />
                  </button>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type Your Message"
                    className="flex-1 py-3 bg-transparent border-none outline-none text-[15px] font-medium text-slate-800 placeholder:text-slate-400"
                  />
                  <div className="flex items-center gap-1 pr-1">
                    <button
                      type="button"
                      className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <Smile size={20} />
                    </button>

                    <input
                      type="file"
                      ref={chatImageInputRef}
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <button
                      type="button"
                      onClick={() => chatImageInputRef.current?.click()}
                      disabled={uploadingImage}
                      className={`p-2 transition-colors ${uploadingImage ? "text-indigo-400 animate-pulse" : "text-slate-400 hover:text-indigo-600"}`}
                      title="Gá»­i áº£nh Ä‘Ã­nh kÃ¨m"
                    >
                      {uploadingImage ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <Paperclip size={20} />
                      )}
                    </button>

                    <button
                      type="submit"
                      disabled={!inputValue.trim()}
                      className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-300 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-300 mb-6">
                <Send size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">
                Your Messages
              </h3>
              <p className="text-sm font-bold text-slate-400">
                Select a contact to start a conversation
              </p>
            </div>
          )}
        </div>
      </div>
    );
}
