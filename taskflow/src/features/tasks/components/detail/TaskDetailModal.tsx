"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { getProjectMembers } from "@/actions/project.actions";
import { 
    addTaskAssignee, removeTaskAssignee, getTaskAssignees, 
    getTaskMessages, addTaskMessage, updateTask, deleteTask,
    updateTaskMessage, deleteTaskMessage
} from "@/actions/task.actions";
import { Button } from "@/components/ui/Button";
import { AppImage } from "@/components/ui/AppImage";
import { toast } from "sonner";
import { createBrowserClient } from "@supabase/ssr";
import { Image as ImageIcon, Paperclip, Smile, Send, Loader2, X, Maximize2, MessageSquare, CheckCircle2 } from 'lucide-react';
import { AssigneesSummary } from "./AssigneesSummary";
import { DeleteTaskConfirm } from "./DeleteTaskConfirm";
import { RelatedFilesPanel } from "./RelatedFilesPanel";
import { ZoomImageOverlay } from "./ZoomImageOverlay";

interface TaskDetailModalProps {
  task: any;
  groupId: string;
  onClose: () => void;
  currentUser: any;
  canEdit?: boolean;
  canCreate?: boolean;
}

export default function TaskDetailModal({ task, groupId, onClose, currentUser, canEdit = true, canCreate = false }: TaskDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  
  // Chỉnh sửa Task
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.Title);
  const [editDesc, setEditDesc] = useState(task.Description || "");
  const [isDeleting, setIsDeleting] = useState(false);

  // Chỉnh sửa Tin nhắn
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editMsgContent, setEditMsgContent] = useState("");
  const [deletingMsgId, setDeletingMsgId] = useState<string | null>(null);

  // Xem ảnh to
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // DANH SÁCH NGƯỜI THỰC HIỆN
  const [assignees, setAssignees] = useState<any[]>([]);

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  useEffect(() => {
    setMounted(true);
    loadData();
    setEditTitle(task.Title);
    setEditDesc(task.Description || "");
    return () => setMounted(false);
  }, [task]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // LẮNG NGHE TIN NHẮN REALTIME
  useEffect(() => {
    const channel = supabase
      .channel(`task-messages-${task.Id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "TaskMessages", filter: `TaskId=eq.${task.Id}` },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const newMsg = payload.new as any;
            const { data: fullMsg } = await supabase
                .from("TaskMessages")
                .select("*, Sender:SenderId(FullName, Email)")
                .eq("Id", newMsg.Id)
                .single();
            if (fullMsg) {
                setMessages(prev => prev.some(m => m.Id === fullMsg.Id) ? prev : [...prev, fullMsg]);
            }
          } else if (payload.eventType === "UPDATE") {
            const updatedMsg = payload.new as any;
            setMessages(prev => prev.map(m => m.Id === updatedMsg.Id ? { ...m, Content: updatedMsg.Content } : m));
          } else if (payload.eventType === "DELETE") {
            const deletedMsg = payload.old as any;
            setMessages(prev => prev.filter(m => m.Id !== deletedMsg.Id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [task.Id, supabase]);

  const loadData = async () => {
    const projMembers = await getProjectMembers(groupId);
    setMembers(projMembers);
    const taskMessages = await getTaskMessages(task.Id);
    setMessages(taskMessages);
    const taskAssignees = await getTaskAssignees(task.Id);
    setAssignees(taskAssignees);
  };

  const handleUpdate = async () => {
    if (!editTitle.trim()) { toast.error("Tiêu đề không được để trống"); return; }
    setLoading(true);
    try {
      await updateTask(task.Id, editTitle, editDesc);
      setIsEditing(false);
      toast.success("Đã cập nhật nhiệm vụ");
    } catch (err) { toast.error("Lỗi khi cập nhật"); }
    setLoading(false);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      await deleteTask(task.Id);
      toast.success("Đã xóa nhiệm vụ");
      onClose();
    } catch (err) { toast.error("Lỗi khi xóa nhiệm vụ"); }
    setLoading(false);
  };

  const handleToggleAssignee = async (userId: string, user: any) => {
    const isAssigned = assignees.some(a => a.UserId === userId);
    try {
        if (isAssigned) {
          setAssignees(prev => prev.filter(a => a.UserId !== userId));
          await removeTaskAssignee(task.Id, userId);
          toast.info(`Đã gỡ ${user.FullName}`);
        } else {
          const newAssignee = { UserId: userId, user: user };
          setAssignees(prev => [...prev, newAssignee]);
          await addTaskAssignee(task.Id, userId);
          toast.success(`Đã thêm ${user.FullName} vào nhiệm vụ`);
        }
    } catch (err) {
        toast.error("Lỗi khi thay đổi người thực hiện");
        loadData();
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, contentOverride?: string) => {
    if (e) e.preventDefault();
    const content = contentOverride || newMessage;
    if (!content.trim() || !currentUser || loading) return;
    
    if (!contentOverride) setLoading(true);
    try {
      const msg = await addTaskMessage(task.Id, currentUser.Id, content);
      setMessages(prev => prev.some(m => m.Id === msg.Id) ? prev : [...prev, msg]);
      if (!contentOverride) setNewMessage("");
    } catch (err) { toast.error("Lỗi khi gửi tin nhắn"); }
    setLoading(false);
  };

  const handleChatFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    if (file.size > 5 * 1024 * 1024) {
        toast.error("File gửi đi phải dưới 5MB!");
        return;
    }

    setLoading(true);
    try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            const base64data = reader.result as string;
            const { uploadImage } = await import('@/actions/media.actions');
            const result = await uploadImage(base64data, 'task_files');

            if (result?.url) {
                const isImage = file.type.startsWith('image/');
                const text = isImage 
                    ? `[IMAGE]${result.url}` 
                    : `[FILE]${result.url}|${file.name}`;
                
                await handleSendMessage(undefined, text);
                toast.success("Đã gửi tệp tin");
            }
            setLoading(false);
            if (chatFileInputRef.current) chatFileInputRef.current.value = "";
        };
    } catch (error: any) {
        toast.error("Lỗi gửi tệp: " + error.message);
        setLoading(false);
    }
  };

  const handleUpdateMsg = async (msgId: string) => {
    if (!editMsgContent.trim()) return;
    try {
        await updateTaskMessage(msgId, editMsgContent);
        setMessages(prev => prev.map(m => m.Id === msgId ? { ...m, Content: editMsgContent } : m));
        setEditingMsgId(null);
        toast.success("Đã sửa tin nhắn");
    } catch (err) { toast.error("Lỗi khi sửa tin nhắn"); }
  };

  const handleDeleteMsg = async (msgId: string) => {
    const msgToDelete = messages.find(m => m.Id === msgId);
    if (!msgToDelete) return;

    if (window.confirm("Bạn có chắc chắn muốn xóa tin nhắn này?")) {
        try {
            if (msgToDelete.Content?.startsWith('[IMAGE]') || msgToDelete.Content?.startsWith('[FILE]')) {
                const parts = msgToDelete.Content.split(']');
                const urlPart = parts[1].split('|')[0];
                const { deleteImage } = await import('@/actions/media.actions');
                await deleteImage(urlPart);
            }
            await deleteTaskMessage(msgId);
            setMessages(prev => prev.filter(m => m.Id !== msgId));
            setDeletingMsgId(null);
            toast.success("Đã xóa tin nhắn");
        } catch (err) { toast.error("Lỗi khi xóa tin nhắn"); }
    }
  };

  const relatedFiles = useMemo(() => {
    return messages
        .filter(m => m.Content?.startsWith('[FILE]'))
        .map(m => {
            const data = m.Content.replace('[FILE]', '').split('|');
            return {
                url: data[0],
                name: data[1] || 'document.pdf',
                createdAt: m.CreatedAt,
                sender: m.Sender?.FullName
            };
        });
  }, [messages]);

  const isImageUrl = (url: string) => {
    return url?.startsWith('[IMAGE]') || url?.match(/\.(jpeg|jpg|gif|png|webp)$/) != null || url?.includes("res.cloudinary.com");
  };

  const filteredMembers = members.filter(m => 
    m.user.FullName?.toLowerCase().includes(memberSearchQuery.toLowerCase())
  );

  const statusLabel: any = { TODO: "Cần làm", IN_PROGRESS: "Đang tiến hành", DONE: "Hoàn thành" };
  const statusColor: any = { TODO: "bg-slate-100 text-slate-600", IN_PROGRESS: "bg-blue-100 text-blue-600", DONE: "bg-green-100 text-green-600" };

  const canManageTask = canEdit && (canCreate || currentUser?.Id === task.CreatorId);

  if (!mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-9999 p-4 backdrop-blur-sm animate-in fade-in duration-300">
      
      {/* ZOOM IMAGE OVERLAY */}
      {zoomImage && (
          <ZoomImageOverlay imageUrl={zoomImage} onClose={() => setZoomImage(null)} />
      )}

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[92vh] flex overflow-hidden relative animate-in zoom-in-95 duration-300">
        
        {/* MODAL XÁC NHẬN XÓA TASK */}
        {isDeleting && (
          <DeleteTaskConfirm
            loading={loading}
            onCancel={() => setIsDeleting(false)}
            onConfirm={handleConfirmDelete}
          />
        )}

        {/* LEFT: Task Detail */}
        <div className="flex-1 flex flex-col border-r border-slate-100 bg-white">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-3">
              <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider ${statusColor[task.Status]}`}>
                {statusLabel[task.Status]}
              </span>
              <span className="text-xs text-slate-400 font-mono">#{task.Id.substring(0, 8)}</span>
            </div>
            <div className="flex items-center gap-2">
              {canManageTask && !isEditing && (
                <>
                  <button onClick={() => setIsEditing(true)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Chỉnh sửa">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => setIsDeleting(true)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Xóa nhiệm vụ">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </>
              )}
              <div className="w-px h-6 bg-slate-200 mx-2"></div>
              <button onClick={onClose} className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"><X className="w-6 h-6" /></button>
            </div>
          </div>

          <div className="p-10 flex-1 overflow-y-auto custom-scrollbar">
            {isEditing ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Tiêu đề nhiệm vụ</label>
                  <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-2xl text-black transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Mô tả chi tiết</label>
                  <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={10} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none text-black leading-relaxed text-lg transition-all font-medium" placeholder="Nhập mô tả..." />
                </div>
                <div className="flex gap-3 justify-end pt-6">
                  <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-xl font-bold">Hủy bỏ</Button>
                  <Button onClick={handleUpdate} disabled={loading} className="bg-blue-600 text-white px-10 py-6 rounded-2xl shadow-xl shadow-blue-600/20 font-bold text-lg">Cập nhật ngay</Button>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in duration-500">
                <h2 className="text-4xl font-black text-slate-900 mb-8 leading-[1.1] tracking-tight">{task.Title}</h2>
                <div className="prose prose-slate max-w-none text-slate-600 mb-12 leading-relaxed text-xl font-medium">
                  {task.Description ? task.Description.split('\n').map((line: any, i: any) => <p key={i} className="mb-4">{line}</p>) : <p className="italic text-slate-400 font-normal">Chưa có mô tả chi tiết cho nhiệm vụ này.</p>}
                </div>
                <AssigneesSummary
                  assignees={assignees}
                  canManageTask={canManageTask}
                  onToggleAssignee={handleToggleAssignee}
                />

                <RelatedFilesPanel files={relatedFiles} />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Member Selection & Messages */}
        <div className="w-[440px] flex flex-col bg-slate-50/50">
          {/* Member Selection */}
          <div className="p-8 border-b border-slate-200/60 bg-white">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Phân công</h4>
              <div className="relative group">
                <input type="text" placeholder="Tìm..." value={memberSearchQuery} onChange={e => setMemberSearchQuery(e.target.value)} className="pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all w-32 text-slate-900 font-bold" />
                <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {filteredMembers.map((m, i) => {
                const isAssigned = assignees.some(a => a.UserId === m.user.Id);
                return (
                  <button 
                    key={i} 
                    onClick={() => canManageTask && handleToggleAssignee(m.user.Id, m.user)} 
                    disabled={!canManageTask}
                    className={`shrink-0 flex flex-col items-center gap-2 transition-all active:scale-90 ${!canManageTask ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg transition-all relative overflow-hidden ${isAssigned ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:border-blue-400 hover:bg-white hover:text-blue-600'}`}>
                      {m.user.AvatarUrl ? (
                          <AppImage src={m.user.AvatarUrl} alt={m.user.FullName} fill className="w-full h-full" imageClassName="object-cover" sizes="56px" />
                      ) : (
                          m.user.FullName.charAt(0)
                      )}
                      {isAssigned && (
                          <div className="absolute -top-1.5 -right-1.5 bg-green-500 text-white rounded-full p-1 border-4 border-white shadow-lg">
                              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                          </div>
                      )}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${isAssigned ? 'text-blue-600' : 'text-slate-400'} max-w-[60px] truncate`}>{m.user.FullName.split(' ').pop()}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-[#fcfdfe]">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Thảo luận nhiệm vụ</h4>
            {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 opacity-30 grayscale">
                    <MessageSquare className="w-12 h-12 mb-4" />
                    <p className="text-sm font-bold">Chưa có tin nhắn nào</p>
                </div>
            )}
            <div className="space-y-6">
                {messages.map((msg, i) => (
                <div key={msg.Id || i} className={`flex gap-4 group animate-in slide-in-from-bottom-2 duration-500 ${msg.SenderId === currentUser?.Id ? "flex-row-reverse" : ""}`}>
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-xs font-black shrink-0 shadow-sm overflow-hidden">
                        {msg.Sender?.AvatarUrl ? (
                            <AppImage src={msg.Sender.AvatarUrl} alt={msg.Sender.FullName} fill className="w-full h-full" imageClassName="object-cover" sizes="40px" />
                        ) : (
                            msg.Sender?.FullName?.charAt(0)
                        )}
                    </div>
                    <div className={`flex flex-col max-w-[80%] ${msg.SenderId === currentUser?.Id ? "items-end" : "items-start"}`}>
                        <div className="flex items-center gap-2 mb-1.5 px-1">
                            {msg.SenderId !== currentUser?.Id && <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">{msg.Sender?.FullName}</span>}
                            <span className="text-[9px] font-bold text-slate-300 uppercase">{new Date(msg.CreatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        
                        {editingMsgId === msg.Id ? (
                            <div className="flex flex-col gap-2 w-[280px] bg-white p-3 rounded-2xl border-2 border-blue-400 shadow-xl">
                                <textarea autoFocus value={editMsgContent} onChange={e => setEditMsgContent(e.target.value)} className="w-full text-sm p-0 bg-transparent border-none outline-none text-slate-900 font-medium resize-none" rows={3} />
                                <div className="flex gap-2 justify-end border-t border-slate-100 pt-2">
                                    <button onClick={() => setEditingMsgId(null)} className="text-[10px] text-slate-400 font-black uppercase tracking-widest hover:text-slate-600">Hủy</button>
                                    <button onClick={() => handleUpdateMsg(msg.Id)} className="text-[10px] text-blue-600 font-black uppercase tracking-widest hover:text-blue-800">Lưu</button>
                                </div>
                            </div>
                        ) : (
                            <div className="relative group/bubble flex items-center gap-2">
                                {msg.Content?.startsWith('[IMAGE]') ? (
                                    <div className="relative group/img overflow-hidden rounded-2xl border-2 border-white shadow-xl transition-all hover:scale-[1.02] cursor-zoom-in" onClick={() => setZoomImage(msg.Content.replace('[IMAGE]', ''))}>
                                        <AppImage src={msg.Content.replace('[IMAGE]', '')} alt="Chat media" width={280} height={360} className="max-w-[280px] max-h-[360px] object-cover" />
                                        <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-all flex items-center justify-center">
                                            <Maximize2 className="w-8 h-8 text-white opacity-0 group-hover/img:opacity-100 transition-opacity drop-shadow-lg" />
                                        </div>
                                    </div>
                                ) : msg.Content?.startsWith('[FILE]') ? (
                                    (() => {
                                        const fileData = msg.Content.replace('[FILE]', '').split('|');
                                        const fileUrl = fileData[0];
                                        const fileName = fileData[1] || 'document.pdf';
                                        const downloadUrl = fileUrl.replace('/upload/', '/upload/fl_attachment/');
                                        return (
                                            <div className={`px-4 py-3 flex items-center gap-3 rounded-2xl border shadow-sm transition-all hover:shadow-md ${
                                                msg.SenderId === currentUser?.Id ? 'bg-blue-700 border-blue-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                                            }`}>
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                                                    msg.SenderId === currentUser?.Id ? 'bg-blue-600' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                    <Paperclip className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <p className="text-[13px] font-bold truncate leading-tight mb-0.5">{fileName}</p>
                                                    <p className={`text-[9px] font-black uppercase tracking-widest ${msg.SenderId === currentUser?.Id ? 'text-blue-300' : 'text-slate-400'}`}>Tài liệu</p>
                                                </div>
                                                <a 
                                                    href={downloadUrl} 
                                                    download={fileName}
                                                    className={`p-2 rounded-lg transition-all active:scale-90 ${
                                                        msg.SenderId === currentUser?.Id ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                                                    }`}
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                </a>
                                            </div>
                                        );
                                    })()
                                ) : (
                                    <div className={`px-5 py-3 rounded-2xl text-sm font-medium shadow-sm leading-relaxed ${msg.SenderId === currentUser?.Id ? "bg-blue-600 text-white rounded-tr-sm" : "bg-white text-slate-700 border border-slate-100 rounded-tl-sm"}`}>
                                        {msg.Content}
                                    </div>
                                )}

                                {/* Action buttons */}
                                {msg.SenderId === currentUser?.Id && (
                                    <div className={`flex gap-1 opacity-0 group-hover/bubble:opacity-100 transition-all duration-200 ${msg.SenderId === currentUser?.Id ? "flex-row-reverse" : "flex-row"}`}>
                                        {(!msg.Content?.startsWith('[IMAGE]') && !msg.Content?.startsWith('[FILE]')) && (
                                            <button onClick={() => { setEditingMsgId(msg.Id); setEditMsgContent(msg.Content); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl shadow-sm transition-all border border-transparent hover:border-slate-100">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            </button>
                                        )}
                                        <button onClick={() => handleDeleteMsg(msg.Id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-xl shadow-sm transition-all border border-transparent hover:border-slate-100">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white border-t border-slate-100">
            {task.Status === 'DONE' ? (
              <div className="flex items-center justify-center gap-3 py-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <p className="text-sm font-bold text-slate-400">Nhiệm vụ này đã hoàn thành. Phần thảo luận đã đóng.</p>
              </div>
            ) : !canEdit ? (
              <div className="flex items-center justify-center gap-3 py-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Loader2 className="w-5 h-5 text-slate-400" />
                <p className="text-sm font-bold text-slate-400">Bạn đang ở chế độ xem. Không thể gửi tin nhắn.</p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex flex-col gap-3">
                <div className="flex gap-3 items-end">
                  <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-100 p-2 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-400 transition-all">
                      <textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Nhập tin nhắn của bạn..." className="w-full px-3 py-2 bg-transparent border-none outline-none text-sm text-slate-900 font-medium placeholder:text-slate-400 resize-none max-h-32" rows={1} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} />
                      <div className="flex items-center gap-2 px-1 pb-1">
                          <button type="button" onClick={() => chatFileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all" title="Gửi ảnh">
                              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                          </button>
                          <button type="button" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all" title="Đính kèm">
                              <Paperclip className="w-4 h-4" />
                          </button>
                          <button type="button" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all" title="Emoji">
                              <Smile className="w-4 h-4" />
                          </button>
                      </div>
                  </div>
                  <button type="submit" disabled={!newMessage.trim() || loading} className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 transition-all active:scale-90 shadow-xl shadow-blue-600/30 disabled:opacity-50 disabled:grayscale">
                      <Send className="w-6 h-6" />
                  </button>
                </div>
                <input type="file" ref={chatFileInputRef} onChange={handleChatFileUpload} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" className="hidden" />
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return mounted ? createPortal(modalContent, document.body) : null;
}
