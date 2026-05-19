"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateProject, deleteProject } from "@/actions/project.actions";

interface ProjectSettingsModalProps {
  group: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectSettingsModal({ group, isOpen, onClose }: ProjectSettingsModalProps) {
  const router = useRouter();
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateProject(group.id, name, description);
    setLoading(false);
    if (res.success) {
      onClose();
      router.refresh();
    } else {
      alert("Lỗi: " + res.message);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    const res = await deleteProject(group.id);
    if (res.success) {
      router.push("/dashboard/projects");
      router.refresh();
    } else {
      setLoading(false);
      alert("Lỗi khi xóa: " + res.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[110] p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-slide-up">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Cài đặt dự án</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {!showDeleteConfirm ? (
          <form onSubmit={handleUpdate} className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Tên dự án</label>
              <Input value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Mô tả</label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm min-h-[100px] outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 hover:bg-red-50"
              >
                Xóa dự án
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-900">Xác nhận xóa dự án?</h3>
                <p className="text-slate-500 text-sm mt-2">Toàn bộ công việc, tin nhắn và dữ liệu liên quan sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.</p>
            </div>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleDelete} 
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 h-12 text-white font-bold"
              >
                {loading ? "Đang xóa..." : "Xác nhận xóa vĩnh viễn"}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setShowDeleteConfirm(false)}
                className="h-12"
              >
                Quay lại
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
