'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/* ─────────────── types ─────────────── */
interface Participant {
    id: string;
    name: string;
    avatar: string;
    isMuted: boolean;
    isCameraOff: boolean;
    isSpeaking: boolean;
    isScreenSharing: boolean;
    isPinned: boolean;
}

interface ChatMsg {
    id: string;
    sender: string;
    content: string;
    time: string;
}

interface Reaction {
    id: string;
    emoji: string;
    x: number;
}

/* ─────────────── data ─────────────── */
const INITIAL_PARTICIPANTS: Participant[] = [
    { id: 'me', name: 'You (Quốc Bình)', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', isMuted: false, isCameraOff: false, isSpeaking: false, isScreenSharing: false, isPinned: false },
    { id: 'p2', name: 'Mai Vũ', avatar: 'https://i.pravatar.cc/150?u=1', isMuted: true, isCameraOff: false, isSpeaking: false, isScreenSharing: false, isPinned: false },
    { id: 'p3', name: 'Trần Minh Chi', avatar: 'https://i.pravatar.cc/150?u=3', isMuted: false, isCameraOff: false, isSpeaking: false, isScreenSharing: false, isPinned: false },
    { id: 'p4', name: 'Thảo Vi', avatar: 'https://i.pravatar.cc/150?u=5', isMuted: false, isCameraOff: true, isSpeaking: false, isScreenSharing: false, isPinned: false },
];

const CHAT_MESSAGES: ChatMsg[] = [
    { id: '1', sender: 'Mai Vũ', content: 'Can everyone hear me?', time: '15:01' },
    { id: '2', sender: 'Trần Minh Chi', content: 'Yes, loud and clear! 👍', time: '15:01' },
    { id: '3', sender: 'Thảo Vi', content: 'My camera is having issues, will join video soon', time: '15:02' },
];

const AUTO_CHAT = [
    { sender: 'Mai Vũ', content: 'Let me share the latest design updates' },
    { sender: 'Trần Minh Chi', content: 'The sprint looks on track! 🎯' },
    { sender: 'Thảo Vi', content: 'I have a question about the API integration' },
    { sender: 'Mai Vũ', content: 'Great progress everyone! 🎉' },
    { sender: 'Trần Minh Chi', content: 'Can we discuss the timeline?' },
];

const REACTION_EMOJIS = ['👍', '❤️', '😂', '🎉', '🔥', '👏'];

/* ─────────────── component ─────────────── */
export default function MeetingPage() {
    const router = useRouter();

    // States
    const [participants, setParticipants] = useState(INITIAL_PARTICIPANTS);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isHandRaised, setIsHandRaised] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showParticipants, setShowParticipants] = useState(false);
    const [showReactions, setShowReactions] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMsg[]>(CHAT_MESSAGES);
    const [chatInput, setChatInput] = useState('');
    const [reactions, setReactions] = useState<Reaction[]>([]);
    const [elapsedSeconds, setElapsedSeconds] = useState(924); // start at 15:24
    const [layout, setLayout] = useState<'grid' | 'speaker'>('grid');
    const [pinnedId, setPinnedId] = useState<string | null>(null);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Timer
    useEffect(() => {
        const interval = setInterval(() => {
            setElapsedSeconds((s) => s + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (s: number) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    // Simulate random speaking indicator
    useEffect(() => {
        const interval = setInterval(() => {
            setParticipants((prev) =>
                prev.map((p) => ({
                    ...p,
                    isSpeaking: !p.isMuted && Math.random() > 0.65,
                }))
            );
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // Auto scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    // Camera access
    useEffect(() => {
        if (!isCameraOff && videoRef.current) {
            navigator.mediaDevices
                .getUserMedia({ video: true, audio: false })
                .then((stream) => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                })
                .catch(() => {
                    // Camera not available — fallback to avatar
                    setIsCameraOff(true);
                });
        }
        return () => {
            if (videoRef.current?.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
            }
        };
    }, [isCameraOff]);

    // Send chat message
    const sendChatMessage = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            if (!chatInput.trim()) return;
            setChatMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    sender: 'You',
                    content: chatInput,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
            ]);
            setChatInput('');

            // Auto reply
            setTimeout(() => {
                const reply = AUTO_CHAT[Math.floor(Math.random() * AUTO_CHAT.length)];
                setChatMessages((prev) => [
                    ...prev,
                    {
                        id: (Date.now() + 1).toString(),
                        sender: reply.sender,
                        content: reply.content,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                ]);
            }, 1500 + Math.random() * 2000);
        },
        [chatInput]
    );

    // Fire reaction
    const fireReaction = (emoji: string) => {
        const id = Date.now().toString();
        const x = 20 + Math.random() * 60;
        setReactions((prev) => [...prev, { id, emoji, x }]);
        setShowReactions(false);
        setTimeout(() => {
            setReactions((prev) => prev.filter((r) => r.id !== id));
        }, 3000);
    };

    // Toggle pin
    const togglePin = (id: string) => {
        if (pinnedId === id) {
            setPinnedId(null);
            setLayout('grid');
        } else {
            setPinnedId(id);
            setLayout('speaker');
        }
    };

    const pinnedParticipant = participants.find((p) => p.id === pinnedId);
    const unpinnedParticipants = participants.filter((p) => p.id !== pinnedId);

    /* ─────────────── render helpers ─────────────── */
    const renderParticipantTile = (p: Participant, isLarge = false) => (
        <div
            key={p.id}
            onClick={() => togglePin(p.id)}
            className={`relative bg-slate-800/80 backdrop-blur rounded-2xl overflow-hidden flex items-center justify-center group cursor-pointer transition-all duration-300 hover:ring-2 hover:ring-white/20 ${p.isSpeaking ? 'ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/20' : ''
                } ${isLarge ? 'col-span-full row-span-full' : ''}`}
        >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700/50 to-slate-900/80" />

            {/* Video / Avatar */}
            {p.id === 'me' && !isCameraOff ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                />
            ) : p.isCameraOff ? (
                <div className="relative flex flex-col items-center z-10">
                    <div className={`rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl ${isLarge ? 'w-32 h-32' : 'w-20 h-20'}`}>
                        <img src={p.avatar} alt={p.name} className="w-full h-full rounded-full" />
                    </div>
                </div>
            ) : (
                <div className="relative flex flex-col items-center z-10">
                    <div className={`rounded-full ring-4 ${p.isSpeaking ? 'ring-emerald-400' : 'ring-slate-700'} transition-all shadow-2xl ${isLarge ? 'w-32 h-32' : 'w-20 h-20'}`}>
                        <img src={p.avatar} alt={p.name} className="w-full h-full rounded-full" />
                    </div>
                </div>
            )}

            {/* Speaking pulse animation */}
            {p.isSpeaking && (
                <div className="absolute inset-0 border-2 border-emerald-400/30 rounded-2xl animate-pulse" />
            )}

            {/* Name + status bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-medium drop-shadow-lg">{p.name}</span>
                        {p.isSpeaking && (
                            <div className="flex items-center gap-0.5">
                                <div className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse" />
                                <div className="w-1 h-4 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '100ms' }} />
                                <div className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5">
                        {p.isMuted && (
                            <div className="bg-red-500/90 p-1 rounded-full">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                </svg>
                            </div>
                        )}
                        {p.isCameraOff && (
                            <div className="bg-red-500/90 p-1 rounded-full">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="2" />
                                </svg>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Pin indicator */}
            {pinnedId === p.id && (
                <div className="absolute top-3 right-3 bg-blue-500/90 text-white p-1.5 rounded-lg z-10">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                </div>
            )}

            {/* Hand raised */}
            {p.id === 'me' && isHandRaised && (
                <div className="absolute top-3 left-3 text-2xl animate-bounce z-10">✋</div>
            )}
        </div>
    );

    return (
        <div className="h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            </div>

            {/* Floating reactions */}
            {reactions.map((r) => (
                <div
                    key={r.id}
                    className="absolute bottom-24 text-4xl z-50 pointer-events-none animate-float-up"
                    style={{ left: `${r.x}%` }}
                >
                    {r.emoji}
                </div>
            ))}

            {/* ─── Top Bar ─── */}
            <div className="relative h-16 flex items-center justify-between px-6 z-20">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/50" />
                        <h1 className="text-white font-bold text-lg tracking-tight">Weekly Standup</h1>
                    </div>
                    <div className="h-5 w-px bg-slate-700" />
                    <div className="flex items-center gap-2 bg-slate-800/60 backdrop-blur px-3 py-1.5 rounded-full">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-slate-300 text-sm font-mono font-medium">{formatTime(elapsedSeconds)}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Layout toggle */}
                    <button
                        onClick={() => { setLayout(layout === 'grid' ? 'speaker' : 'grid'); if (layout === 'speaker') setPinnedId(null); }}
                        className="p-2.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition-all"
                        title={layout === 'grid' ? 'Speaker view' : 'Grid view'}
                    >
                        {layout === 'grid' ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
                            </svg>
                        )}
                    </button>

                    {/* Participant count */}
                    <div className="flex items-center gap-2 bg-slate-800/60 backdrop-blur px-3 py-1.5 rounded-full">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span className="text-slate-300 text-sm font-medium">{participants.length}</span>
                    </div>
                </div>
            </div>

            {/* ─── Main Content ─── */}
            <div className="flex-1 flex relative z-10 overflow-hidden px-4 pb-2">
                {/* Video Grid */}
                <div className={`flex-1 ${showChat || showParticipants ? 'mr-80' : ''} transition-all duration-300`}>
                    {layout === 'grid' ? (
                        /* Grid Layout */
                        <div className={`grid gap-3 h-full p-2 ${participants.length <= 1 ? 'grid-cols-1' :
                                participants.length <= 4 ? 'grid-cols-2 grid-rows-2' :
                                    'grid-cols-3 grid-rows-2'
                            }`}>
                            {participants.map((p) => renderParticipantTile(p))}
                        </div>
                    ) : (
                        /* Speaker Layout */
                        <div className="flex flex-col gap-3 h-full p-2">
                            <div className="flex-1">
                                {renderParticipantTile(pinnedParticipant || participants[0], true)}
                            </div>
                            <div className="flex gap-3 h-28 shrink-0">
                                {(pinnedParticipant ? unpinnedParticipants : participants.slice(1)).map((p) => (
                                    <div key={p.id} className="flex-1">
                                        {renderParticipantTile(p)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── Side Panel: Chat ─── */}
                {showChat && (
                    <div className="fixed right-4 top-16 bottom-24 w-80 bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 flex flex-col z-30 shadow-2xl animate-slide-in-right overflow-hidden">
                        <div className="p-4 border-b border-slate-700/50 flex items-center justify-between shrink-0">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                                In-call Chat
                            </h3>
                            <button onClick={() => setShowChat(false)} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {chatMessages.map((msg) => (
                                <div key={msg.id} className={`${msg.sender === 'You' ? 'text-right' : ''}`}>
                                    <div className="flex items-baseline gap-2 mb-0.5" style={{ justifyContent: msg.sender === 'You' ? 'flex-end' : 'flex-start' }}>
                                        <span className="text-xs font-bold text-blue-400">{msg.sender}</span>
                                        <span className="text-[10px] text-slate-500">{msg.time}</span>
                                    </div>
                                    <div
                                        className={`inline-block px-3 py-2 rounded-xl text-sm max-w-[85%] ${msg.sender === 'You'
                                                ? 'bg-blue-600 text-white rounded-tr-sm'
                                                : 'bg-slate-800 text-slate-200 rounded-tl-sm'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        <form onSubmit={sendChatMessage} className="p-3 border-t border-slate-700/50 shrink-0">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500"
                                />
                                <button
                                    type="submit"
                                    disabled={!chatInput.trim()}
                                    className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ─── Side Panel: Participants ─── */}
                {showParticipants && (
                    <div className="fixed right-4 top-16 bottom-24 w-80 bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 flex flex-col z-30 shadow-2xl animate-slide-in-right overflow-hidden">
                        <div className="p-4 border-b border-slate-700/50 flex items-center justify-between shrink-0">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                Participants ({participants.length})
                            </h3>
                            <button onClick={() => setShowParticipants(false)} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3">
                            <div className="space-y-1">
                                {participants.map((p) => (
                                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/60 transition-colors group">
                                        <div className="relative">
                                            <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full ring-2 ring-slate-700" />
                                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 bg-emerald-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">
                                                {p.name}
                                                {p.id === 'me' && <span className="text-slate-400 text-xs ml-1">(You)</span>}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                {p.isSpeaking && <span className="text-[10px] text-emerald-400">● Speaking</span>}
                                                {p.id === 'me' && isHandRaised && <span className="text-[10px]">✋ Hand raised</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {p.isMuted && (
                                                <div className="p-1 bg-red-500/20 rounded-full">
                                                    <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                                    </svg>
                                                </div>
                                            )}
                                            {p.isCameraOff && (
                                                <div className="p-1 bg-red-500/20 rounded-full">
                                                    <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── Control Bar ─── */}
            <div className="relative h-20 flex items-center justify-center z-20">
                <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-xl rounded-2xl px-4 py-2 border border-slate-700/50 shadow-2xl">
                    {/* Mic */}
                    <button
                        onClick={() => { setIsMuted(!isMuted); setParticipants(prev => prev.map(p => p.id === 'me' ? { ...p, isMuted: !isMuted } : p)); }}
                        className={`p-3.5 rounded-xl transition-all duration-200 ${isMuted ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30' : 'bg-slate-700/80 hover:bg-slate-600 text-white'}`}
                        title={isMuted ? 'Unmute' : 'Mute'}
                    >
                        {isMuted ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        )}
                    </button>

                    {/* Camera */}
                    <button
                        onClick={() => { setIsCameraOff(!isCameraOff); setParticipants(prev => prev.map(p => p.id === 'me' ? { ...p, isCameraOff: !isCameraOff } : p)); }}
                        className={`p-3.5 rounded-xl transition-all duration-200 ${isCameraOff ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30' : 'bg-slate-700/80 hover:bg-slate-600 text-white'}`}
                        title={isCameraOff ? 'Turn on camera' : 'Turn off camera'}
                    >
                        {isCameraOff ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        )}
                    </button>

                    {/* Screen Share */}
                    <button
                        onClick={() => setIsScreenSharing(!isScreenSharing)}
                        className={`p-3.5 rounded-xl transition-all duration-200 ${isScreenSharing ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-700/80 hover:bg-slate-600 text-white'}`}
                        title="Share screen"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </button>

                    <div className="w-px h-8 bg-slate-700 mx-1" />

                    {/* Raise hand */}
                    <button
                        onClick={() => setIsHandRaised(!isHandRaised)}
                        className={`p-3.5 rounded-xl transition-all duration-200 ${isHandRaised ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/30' : 'bg-slate-700/80 hover:bg-slate-600 text-white'}`}
                        title="Raise hand"
                    >
                        <span className="text-lg">✋</span>
                    </button>

                    {/* Reactions */}
                    <div className="relative">
                        <button
                            onClick={() => setShowReactions(!showReactions)}
                            className={`p-3.5 rounded-xl transition-all duration-200 ${showReactions ? 'bg-purple-500 hover:bg-purple-600 text-white' : 'bg-slate-700/80 hover:bg-slate-600 text-white'}`}
                            title="Reactions"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                        {showReactions && (
                            <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 flex gap-1 bg-slate-800 rounded-2xl px-3 py-2 border border-slate-700 shadow-2xl animate-slide-up">
                                {REACTION_EMOJIS.map((emoji) => (
                                    <button
                                        key={emoji}
                                        onClick={() => fireReaction(emoji)}
                                        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-700 text-xl transition-all hover:scale-125"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="w-px h-8 bg-slate-700 mx-1" />

                    {/* Chat */}
                    <button
                        onClick={() => { setShowChat(!showChat); setShowParticipants(false); }}
                        className={`p-3.5 rounded-xl transition-all duration-200 relative ${showChat ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-slate-700/80 hover:bg-slate-600 text-white'}`}
                        title="Chat"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        {chatMessages.length > 3 && !showChat && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {chatMessages.length - 3}
                            </span>
                        )}
                    </button>

                    {/* Participants */}
                    <button
                        onClick={() => { setShowParticipants(!showParticipants); setShowChat(false); }}
                        className={`p-3.5 rounded-xl transition-all duration-200 ${showParticipants ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-slate-700/80 hover:bg-slate-600 text-white'}`}
                        title="Participants"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </button>

                    <div className="w-px h-8 bg-slate-700 mx-1" />

                    {/* Leave call */}
                    <button
                        onClick={() => setShowLeaveConfirm(true)}
                        className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-all shadow-lg shadow-red-500/30 hover:shadow-red-500/50 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Leave
                    </button>
                </div>
            </div>

            {/* ─── Leave Confirmation Modal ─── */}
            {showLeaveConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl animate-slide-up">
                        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </div>
                        <h3 className="text-white text-lg font-bold text-center mb-2">Leave Meeting?</h3>
                        <p className="text-slate-400 text-sm text-center mb-6">
                            Are you sure you want to leave this meeting? You can rejoin at any time.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLeaveConfirm(false)}
                                className="flex-1 py-3 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
                            >
                                Leave
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
