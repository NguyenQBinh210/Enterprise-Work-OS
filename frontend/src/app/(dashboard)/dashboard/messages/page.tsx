'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
    Search, 
    Plus, 
    MoreVertical, 
    Mic, 
    Smile, 
    Paperclip, 
    Send,
    Check,
    CheckCheck,
    Pin,
    Filter,
    ArrowLeft,
    ImageIcon,
    X,
    Loader2
} from 'lucide-react';

// Preset wallpaper options
const WALLPAPER_PRESETS = [
    { id: 'default', label: 'Mặc định', style: { backgroundColor: '#f8fafc', backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '20px 20px' } },
    { id: 'indigo', label: 'Indigo', style: { background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)' } },
    { id: 'rose', label: 'Rose', style: { background: 'linear-gradient(135deg, #fff1f2 0%, #fdf4ff 100%)' } },
    { id: 'emerald', label: 'Emerald', style: { background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)' } },
    { id: 'amber', label: 'Amber', style: { background: 'linear-gradient(135deg, #fffbeb 0%, #fef9c3 100%)' } },
    { id: 'slate', label: 'Slate Dark', style: { background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' } },
    { id: 'ocean', label: 'Ocean', style: { background: 'linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%)' } },
    { id: 'aurora', label: 'Aurora', style: { background: 'linear-gradient(135deg, #fae8ff 0%, #dbeafe 50%, #dcfce7 100%)' } },
];

export default function MessagesPage() {
    const supabase = createClient();
    
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [activeChat, setActiveChat] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const wallpaperInputRef = useRef<HTMLInputElement>(null);

    // Wallpaper state
    const [showWallpaperPanel, setShowWallpaperPanel] = useState(false);
    const [wallpaper, setWallpaper] = useState<{ id: string; style?: any; url?: string }>(WALLPAPER_PRESETS[0]);
    const [uploadingWallpaper, setUploadingWallpaper] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Load wallpaper from localStorage when chat changes
    useEffect(() => {
        if (!activeChat) return;
        const saved = localStorage.getItem(`wallpaper_${activeChat}`);
        if (saved) {
            try { setWallpaper(JSON.parse(saved)); } catch {}
        } else {
            setWallpaper(WALLPAPER_PRESETS[0]);
        }
    }, [activeChat]);

    const saveWallpaper = (wp: { id: string; style?: any; url?: string }) => {
        if (!activeChat) return;
        setWallpaper(wp);
        localStorage.setItem(`wallpaper_${activeChat}`, JSON.stringify(wp));
        setShowWallpaperPanel(false);
    };

    const handleWallpaperImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 3 * 1024 * 1024) { alert('Ảnh phải nhỏ hơn 3MB!'); return; }
        setUploadingWallpaper(true);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                const { uploadImage } = await import('@/actions/media.actions');
                const result = await uploadImage(base64, 'chat_wallpapers');
                if (result?.url) {
                    saveWallpaper({ id: 'custom', url: result.url, style: { backgroundImage: `url(${result.url})`, backgroundSize: 'cover', backgroundPosition: 'center' } });
                }
                setUploadingWallpaper(false);
            };
        } catch { setUploadingWallpaper(false); }
    };

    // 1. Tải thông tin người dùng hiện tại
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('Users')
                    .select('*')
                    .eq('Email', user.email)
                    .single();
                setCurrentUser(profile);
            }
        };
        fetchUser();
    }, []);

    // 2. Tải danh sách người dùng
    useEffect(() => {
        if (!currentUser) return;
        const fetchUsers = async () => {
            const { data } = await supabase
                .from('Users')
                .select('*')
                .neq('Id', currentUser.Id);
            
            if (data && data.length > 0) {
                const userIds = data.map(u => u.Id);
                const { data: profiles } = await supabase
                    .from('UserProfiles')
                    .select('UserId, AvatarUrl')
                    .in('UserId', userIds);
                
                const usersWithAvatars = data.map(u => {
                    const profile = profiles?.find(p => p.UserId === u.Id);
                    return { ...u, AvatarUrl: profile?.AvatarUrl || null };
                });
                
                setUsers(usersWithAvatars);
                if (!activeChat) {
                    setActiveChat(usersWithAvatars[0].Id);
                }
            } else {
                setUsers([]);
            }
        };
        fetchUsers();
    }, [currentUser]);

    // Âm thanh thông báo
    const playNotificationSound = () => {
        try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.05);
            gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.2);
        } catch (e) {}
    };

    // 3. Real-time Messages
    useEffect(() => {
        if (!currentUser || !activeChat) return;

        const fetchMessages = async () => {
            const { data } = await supabase
                .from('PrivateMessages')
                .select('*')
                .or(`and(SenderId.eq.${currentUser.Id},ReceiverId.eq.${activeChat}),and(SenderId.eq.${activeChat},ReceiverId.eq.${currentUser.Id})`)
                .order('CreatedAt', { ascending: true });
            setMessages(data || []);
        };
        fetchMessages();

        const channel = supabase.channel(`chat:${activeChat}`)
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'PrivateMessages' 
            }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    const newMsg = payload.new;
                    if (newMsg.ReceiverId === currentUser.Id) playNotificationSound();
                    if ((newMsg.SenderId === currentUser.Id && newMsg.ReceiverId === activeChat) || (newMsg.SenderId === activeChat && newMsg.ReceiverId === currentUser.Id)) {
                        setMessages((prev) => {
                            if (prev.some(m => m.Id === newMsg.Id)) return prev;
                            return [...prev, newMsg];
                        });
                    }
                }
                if (payload.eventType === 'UPDATE') {
                    setMessages(prev => prev.map(m => m.Id === payload.new.Id ? payload.new : m));
                }
                if (payload.eventType === 'DELETE') {
                    setMessages(prev => prev.filter(m => m.Id !== payload.old.Id));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUser, activeChat]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || !currentUser || !activeChat) return;

        const text = inputValue;
        setInputValue('');
        const newMsgId = 'msg_' + Math.random().toString(36).substring(2, 8);

        const optimisticMsg = {
            Id: newMsgId,
            SenderId: currentUser.Id,
            ReceiverId: activeChat,
            Content: text,
            CreatedAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisticMsg]);

        await supabase.from('PrivateMessages').insert({
            Id: newMsgId,
            SenderId: currentUser.Id,
            ReceiverId: activeChat,
            Content: text
        });
    };

    const handleDeleteMessage = async (msgId: string) => {
        setMessages(prev => prev.filter(m => m.Id !== msgId));
        await supabase.from('PrivateMessages').delete().eq('Id', msgId);
    };

    const handleUpdateMessage = async (e: React.FormEvent, msgId: string) => {
        e.preventDefault();
        if (!editValue.trim()) return;
        setMessages(prev => prev.map(m => m.Id === msgId ? { ...m, Content: editValue } : m));
        setEditingMessageId(null);
        await supabase.from('PrivateMessages').update({ Content: editValue }).eq('Id', msgId);
    };

    if (!currentUser) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-pulse text-slate-400 font-medium text-lg">Đang kết nối...</div>
            </div>
        );
    }

    const activeUserObj = users.find(u => u.Id === activeChat);
    const filteredUsers = searchQuery.trim()
        ? users.filter(u => u.FullName?.toLowerCase().includes(searchQuery.toLowerCase()) || u.Email?.toLowerCase().includes(searchQuery.toLowerCase()))
        : users;

    return (
        <div className="flex h-[calc(100vh-7rem)] bg-transparent gap-5 animate-slide-up">
            {/* LEFT SIDEBAR */}
            <div className="w-[360px] bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden border border-slate-100 shrink-0">
                {/* Header & Search */}
                <div className="p-6 pb-2">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-slate-800">Chats</h2>
                        <div className="flex gap-2">
                            <button className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                                <Plus size={20} />
                            </button>
                            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
                                <MoreVertical size={20} />
                            </button>
                        </div>
                    </div>
                    
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm kiếm liên hệ..."
                            className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Recent Chats (Horizontal) — ẩn khi đang search */}
                {!searchQuery && (
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="font-bold text-slate-800 text-sm">Gần đây</h3>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                        {users.slice(0, 5).map((u) => (
                            <button key={u.Id} onClick={() => setActiveChat(u.Id)} className="flex flex-col items-center gap-2 shrink-0">
                                <div className="relative">
                                    <div className={`w-14 h-14 rounded-full border-2 border-white shadow-md flex items-center justify-center font-bold text-lg transition-all overflow-hidden ${
                                        activeChat === u.Id ? 'bg-indigo-600 text-white' : 'bg-gradient-to-tr from-slate-200 to-slate-100 text-slate-600'
                                    }`}>
                                        {u.AvatarUrl ? (
                                            <img src={u.AvatarUrl} alt={u.FullName} className="w-full h-full object-cover" />
                                        ) : (
                                            u.FullName.charAt(0)
                                        )}
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                                </div>
                                <span className="text-[11px] font-bold text-slate-500 max-w-[56px] truncate">{u.FullName.split(' ')[0]}</span>
                            </button>
                        ))}
                    </div>
                </div>
                )}

                {/* All Chats (Vertical) */}
                <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-1">
                    <div className="flex items-center justify-between px-3 mb-2">
                        <h3 className="font-bold text-slate-800 text-sm">
                            {searchQuery ? `Kết quả (${filteredUsers.length})` : 'Tất cả'}
                        </h3>
                    </div>

                    {filteredUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                            <Search size={32} strokeWidth={1.5} className="mb-3 text-slate-300" />
                            <p className="text-sm font-bold text-slate-400">Không tìm thấy</p>
                            <p className="text-xs text-slate-300 mt-1">&ldquo;{searchQuery}&rdquo;</p>
                        </div>
                    ) : (
                        filteredUsers.map((u) => (
                        <button
                            key={u.Id}
                            onClick={() => { setActiveChat(u.Id); setSearchQuery(''); }}
                            className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all group ${
                                activeChat === u.Id 
                                    ? 'bg-indigo-50/50 ring-1 ring-indigo-100' 
                                    : 'hover:bg-slate-50'
                            }`}
                        >
                            <div className="relative shrink-0">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg overflow-hidden ${
                                    activeChat === u.Id ? 'bg-indigo-600' : 'bg-gradient-to-br from-slate-400 to-slate-500'
                                }`}>
                                    {u.AvatarUrl ? (
                                        <img src={u.AvatarUrl} alt={u.FullName} className="w-full h-full object-cover" />
                                    ) : (
                                        u.FullName.charAt(0)
                                    )}
                                </div>
                                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <p className="font-bold text-slate-800 truncate text-sm">{u.FullName}</p>
                                <p className="text-xs text-slate-400 truncate mt-0.5">{u.Email}</p>
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
            <div className="flex-1 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden border border-slate-100 relative">
                {/* Dynamic Wallpaper */}
                <div 
                    className="absolute inset-0 pointer-events-none transition-all duration-500"
                    style={wallpaper.style || {}}
                />
                
                {activeUserObj ? (
                    <>
                        {/* Header */}
                        <div className="h-20 px-8 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-100 shrink-0 z-20 relative">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 shadow-sm overflow-hidden">
                                        {activeUserObj.AvatarUrl ? (
                                            <img src={activeUserObj.AvatarUrl} alt={activeUserObj.FullName} className="w-full h-full object-cover" />
                                        ) : (
                                            activeUserObj.FullName.charAt(0)
                                        )}
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-800 leading-tight">{activeUserObj.FullName}</h3>
                                    <p className="text-[11px] font-bold text-emerald-500">Online</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2.5 text-slate-400 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all"><Search size={20} /></button>
                                {/* Wallpaper Button */}
                                <button
                                    onClick={() => setShowWallpaperPanel(v => !v)}
                                    className={`p-2.5 rounded-xl transition-all ${showWallpaperPanel ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-600'}`}
                                    title="Đổi hình nền"
                                >
                                    <ImageIcon size={20} />
                                </button>
                                <button className="p-2.5 text-slate-400 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all"><MoreVertical size={20} /></button>
                            </div>

                            {/* Wallpaper Panel Dropdown */}
                            {showWallpaperPanel && (
                                <div className="absolute top-full right-4 mt-2 w-80 bg-white rounded-2xl shadow-2xl shadow-slate-200/60 border border-slate-100 z-50 overflow-hidden animate-slide-up">
                                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                                        <div>
                                            <p className="font-black text-slate-800 text-sm">Hình nền trò chuyện</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">Chọn preset hoặc tải ảnh lên</p>
                                        </div>
                                        <button onClick={() => setShowWallpaperPanel(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg">
                                            <X size={16} />
                                        </button>
                                    </div>

                                    {/* Preset Grid */}
                                    <div className="p-4 grid grid-cols-4 gap-2">
                                        {WALLPAPER_PRESETS.map((preset) => (
                                            <button
                                                key={preset.id}
                                                onClick={() => saveWallpaper(preset)}
                                                className={`relative h-14 rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${wallpaper.id === preset.id ? 'border-indigo-500 shadow-lg shadow-indigo-200' : 'border-transparent'}`}
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

                                    <p className="px-4 text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Preset</p>
                                    <div className="px-4 pb-4 grid grid-cols-4 gap-1.5">
                                        {WALLPAPER_PRESETS.map(p => (
                                            <span key={p.id} className="text-[9px] text-center text-slate-400 truncate">{p.label}</span>
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
                                            {uploadingWallpaper
                                                ? <><Loader2 size={14} className="animate-spin" /> Đang tải lên...</>
                                                : <><ImageIcon size={14} /> Tải ảnh từ máy tính</>
                                            }
                                        </button>
                                        {wallpaper.id === 'custom' && wallpaper.url && (
                                            <div className="mt-2 flex items-center gap-2 p-2 bg-slate-50 rounded-xl">
                                                <img src={wallpaper.url} alt="Custom wallpaper" className="w-10 h-10 rounded-lg object-cover" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-slate-700 truncate">Ảnh tùy chỉnh</p>
                                                    <p className="text-[10px] text-slate-400">Đang sử dụng</p>
                                                </div>
                                                <button onClick={() => saveWallpaper(WALLPAPER_PRESETS[0])} className="p-1 text-slate-400 hover:text-red-500">
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Message Area */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 z-10 scrollbar-none">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-50">
                                    <Smile size={64} strokeWidth={1} className="mb-4" />
                                    <p className="text-sm font-medium">Bắt đầu cuộc trò chuyện mới</p>
                                </div>
                            ) : (
                                messages.map((msg, index) => {
                                    const isMe = msg.SenderId === currentUser.Id;
                                    const isConsecutive = index > 0 && messages[index - 1].SenderId === msg.SenderId;
                                    
                                    return (
                                        <div key={msg.Id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            {!isConsecutive && (
                                                <div className={`flex items-center gap-2 mb-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                                                    <span className="text-[13px] font-black text-slate-800">
                                                        {isMe ? 'You' : activeUserObj.FullName}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        {new Date(msg.CreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {isMe && <CheckCheck size={14} className="text-indigo-500" />}
                                                </div>
                                            )}
                                            
                                            <div className="flex items-end gap-3 max-w-[80%] group">
                                                {!isMe && !isConsecutive && (
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-500 shrink-0 overflow-hidden">
                                                        {activeUserObj.AvatarUrl ? (
                                                            <img src={activeUserObj.AvatarUrl} alt={activeUserObj.FullName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            activeUserObj.FullName.charAt(0)
                                                        )}
                                                    </div>
                                                )}
                                                {!isMe && isConsecutive && <div className="w-8 shrink-0" />}
                                                
                                                <div className="relative">
                                                    <div className={`px-5 py-3.5 text-[15px] font-medium shadow-sm transition-all ${
                                                        isMe 
                                                            ? 'bg-indigo-600 text-white rounded-[1.5rem] rounded-tr-[0.25rem] shadow-indigo-100' 
                                                            : 'bg-white text-slate-700 rounded-[1.5rem] rounded-tl-[0.25rem] border border-slate-100'
                                                    }`}>
                                                        {msg.Content}
                                                    </div>
                                                    
                                                    {/* Reactions Mockup */}
                                                    {index === messages.length - 2 && (
                                                        <div className="absolute -bottom-3 right-0 flex -space-x-1">
                                                            <div className="w-6 h-6 rounded-full bg-white border border-slate-100 flex items-center justify-center text-xs shadow-sm">😊</div>
                                                            <div className="w-6 h-6 rounded-full bg-white border border-slate-100 flex items-center justify-center text-xs shadow-sm">❤️</div>
                                                            <div className="w-6 h-6 rounded-full bg-white border border-slate-100 flex items-center justify-center text-xs shadow-sm text-slate-500 font-bold">15</div>
                                                        </div>
                                                    )}
                                                </div>

                                                {isMe && (
                                                    <div className="hidden group-hover:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => { setEditingMessageId(msg.Id); setEditValue(msg.Content); }} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg"><MoreVertical size={14} /></button>
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
                        <div className="p-6 bg-white/80 backdrop-blur-md border-t border-slate-100 z-20">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-slate-50 p-2 pl-5 rounded-2xl border border-slate-100 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:bg-white transition-all">
                                <button type="button" className="text-slate-400 hover:text-indigo-600 transition-colors">
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
                                    <button type="button" className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Smile size={20} /></button>
                                    <button type="button" className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Paperclip size={20} /></button>
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
                        <h3 className="text-xl font-black text-slate-800 mb-2">Your Messages</h3>
                        <p className="text-sm font-bold text-slate-400">Select a contact to start a conversation</p>
                    </div>
                )}
            </div>
        </div>
    );
}
