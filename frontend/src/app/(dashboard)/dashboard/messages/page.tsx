'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function MessagesPage() {
    const supabase = createClient();
    
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [activeChat, setActiveChat] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 1. Tải thông tin của người đang đăng nhập
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

    // 2. Tải danh sách tất cả người dùng (Để hiển thị cột bên trái)
    useEffect(() => {
        if (!currentUser) return;
        const fetchUsers = async () => {
            const { data } = await supabase
                .from('Users')
                .select('*')
                .neq('Id', currentUser.Id); // Không lấy chính mình
            setUsers(data || []);
            
            // Tự động chọn người đầu tiên để nhắn tin nếu chưa chọn ai
            if (data && data.length > 0 && !activeChat) {
                setActiveChat(data[0].Id);
            }
        };
        fetchUsers();
    }, [currentUser]);

    // Hàm tạo âm thanh thông báo "Ting" siêu mượt mà không cần file MP3
    const playNotificationSound = () => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;
            const audioCtx = new AudioContext();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            // Cấu hình âm thanh giống tiếng "Pop / Ting" của Messenger
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.05);
            
            gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.2);
        } catch (e) {
            console.error("Lỗi phát âm thanh:", e);
        }
    };

    // 3. Tải tin nhắn CŨ và BẬT Lắng nghe tin nhắn MỚI (Real-time)
    useEffect(() => {
        if (!currentUser || !activeChat) return;

        // Tải lịch sử chat
        const fetchMessages = async () => {
            const { data } = await supabase
                .from('PrivateMessages')
                .select('*')
                // Tìm các tin nhắn giữa Tôi và Người kia (Cả gửi và nhận)
                .or(`and(SenderId.eq.${currentUser.Id},ReceiverId.eq.${activeChat}),and(SenderId.eq.${activeChat},ReceiverId.eq.${currentUser.Id})`)
                .order('CreatedAt', { ascending: true });
            setMessages(data || []);
        };
        fetchMessages();

        // KÍCH HOẠT SUPABASE REAL-TIME (Tự nảy tin nhắn không cần F5)
        const channel = supabase.channel('realtime:private_messages')
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'PrivateMessages' 
            }, (payload) => {
                const newMsg = payload.new;
                
                // Nếu mình là người nhận tin nhắn này -> Phát âm thanh thông báo
                if (newMsg.ReceiverId === currentUser.Id) {
                    playNotificationSound();
                }

                // Kiểm tra xem tin nhắn mới nảy lên có thuộc về đoạn chat hiện tại không
                if (
                    (newMsg.SenderId === currentUser.Id && newMsg.ReceiverId === activeChat) ||
                    (newMsg.SenderId === activeChat && newMsg.ReceiverId === currentUser.Id)
                ) {
                    setMessages((prev) => {
                        // Ngăn chặn trùng lặp tin nhắn nếu máy mình đã tự hiện trước đó
                        if (prev.some(m => m.Id === newMsg.Id)) return prev;
                        return [...prev, newMsg];
                    });
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUser, activeChat]);

    // Tự động cuộn xuống dòng tin nhắn mới nhất
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // 4. Hàm Gửi tin nhắn
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || !currentUser || !activeChat) return;

        const text = inputValue;
        setInputValue(''); // Xóa ô input ngay lập tức

        const newMsgId = 'msg_' + Math.random().toString(36).substring(2, 8);

        // HIỂN THỊ NGAY LẬP TỨC (Optimistic UI)
        const optimisticMsg = {
            Id: newMsgId,
            SenderId: currentUser.Id,
            ReceiverId: activeChat,
            Content: text,
            CreatedAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisticMsg]);

        // Bắn dữ liệu ngầm lên Supabase
        await supabase.from('PrivateMessages').insert({
            Id: newMsgId,
            SenderId: currentUser.Id,
            ReceiverId: activeChat,
            Content: text
        });
    };

    if (!currentUser) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-pulse text-slate-400 font-medium text-lg">Đang kết nối vào hệ thống Chat...</div>
            </div>
        );
    }

    const activeUserObj = users.find(u => u.Id === activeChat);

    return (
        <div className="flex h-[calc(100vh-7rem)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-slide-up">
            {/* Cột trái: Danh sách người dùng (Nhân viên) */}
            <div className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
                <div className="p-5 border-b border-slate-200 bg-white">
                    <h2 className="font-bold text-xl text-slate-800">Trò chuyện</h2>
                    <p className="text-xs text-slate-500 mt-1">Gắn kết đội ngũ doanh nghiệp</p>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                    {users.length === 0 ? (
                        <div className="text-center p-5 text-sm text-slate-400">Chưa có ai khác ngoài bạn. Hãy tạo thêm 1 tài khoản nữa để test nhé!</div>
                    ) : (
                        users.map((u) => (
                            <button
                                key={u.Id}
                                onClick={() => setActiveChat(u.Id)}
                                className={`w-full flex items-center gap-4 px-3 py-3.5 rounded-xl text-left transition-all ${
                                    activeChat === u.Id 
                                        ? 'bg-blue-100 text-blue-900 shadow-sm border border-blue-200' 
                                        : 'hover:bg-slate-200/50 text-slate-600 border border-transparent'
                                }`}
                            >
                                <div className="relative">
                                    <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-sm ${
                                        activeChat === u.Id ? 'bg-blue-600' : 'bg-slate-400'
                                    }`}>
                                        {u.FullName.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold truncate text-[15px]">{u.FullName}</div>
                                    <div className="text-xs opacity-70 truncate">{u.SystemRole}</div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
                {/* Dải thông tin cá nhân ở đáy cột trái */}
                <div className="p-4 border-t border-slate-200 bg-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold">
                        {currentUser.FullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{currentUser.FullName}</p>
                        <p className="text-[11px] text-emerald-600 font-semibold">● Trực tuyến</p>
                    </div>
                </div>
            </div>

            {/* Cột phải: Khung chat chính */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
                {/* Header người đang chat */}
                {activeUserObj ? (
                    <>
                        <div className="h-20 px-8 border-b border-slate-200 flex items-center bg-white shrink-0 gap-4 shadow-sm z-10">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-white text-xl shadow-md">
                                {activeUserObj.FullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="font-extrabold text-lg text-slate-900 tracking-tight">{activeUserObj.FullName}</h2>
                                <p className="text-sm text-slate-500">{activeUserObj.Email}</p>
                            </div>
                        </div>

                        {/* Vùng cuộn tin nhắn */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            {messages.length === 0 ? (
                                <div className="text-center text-slate-400 mt-20 text-sm">
                                    <div className="text-4xl mb-3">👋</div>
                                    Hãy gửi lời chào đến {activeUserObj.FullName} để bắt đầu cuộc trò chuyện.
                                </div>
                            ) : (
                                messages.map((msg, index) => {
                                    const isMe = msg.SenderId === currentUser.Id;
                                    // Kiểm tra xem tin nhắn trước đó có cùng người gửi không để gộp lại cho đẹp
                                    const isConsecutive = index > 0 && messages[index - 1].SenderId === msg.SenderId;
                                    
                                    return (
                                        <div key={msg.Id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isConsecutive ? '-mt-4' : ''}`}>
                                            <div className={`max-w-[65%] px-5 py-3 text-[15px] shadow-sm ${
                                                isMe 
                                                    ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' 
                                                    : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm'
                                            }`}>
                                                {msg.Content}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Ô nhập tin nhắn */}
                        <div className="p-6 bg-white border-t border-slate-200">
                            <form onSubmit={handleSendMessage} className="flex gap-3">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Soạn tin nhắn..."
                                    className="flex-1 px-5 py-3.5 bg-slate-100 text-slate-900 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none text-[15px]"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim()}
                                    className="px-8 py-3.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:bg-slate-300 disabled:text-slate-500 transition-all shadow-md hover:shadow-lg active:scale-95"
                                >
                                    Gửi
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-slate-400 text-center">
                            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Hãy chọn một người bên trái để bắt đầu chat
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
