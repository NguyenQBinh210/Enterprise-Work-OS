"use client";

import { useState, useEffect } from "react";
import { getProjectMembers, inviteMember, searchUsers, inviteMemberById } from "@/actions/project.actions";

interface ProjectMembersModalProps {
  groupId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectMembersModal({ groupId, isOpen, onClose }: ProjectMembersModalProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterQuery, setFilterQuery] = useState(""); // Thêm state lọc thành viên hiện có
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadMembers();
    }
  }, [isOpen]);

  // Logic Tìm kiếm gợi ý (Autocomplete)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        const results = await searchUsers(searchQuery);
        // Lọc bỏ những người đã có trong dự án
        const filtered = results.filter(r => !members.some(m => m.user.Id === r.Id));
        setSearchResults(filtered);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, members]);

  const loadMembers = async () => {
    setLoading(true);
    const data = await getProjectMembers(groupId);
    setMembers(data);
    setLoading(false);
  };

  const handleInviteAction = async (userId: string) => {
    const res = await inviteMemberById(groupId, userId);
    setMessage({ text: res.message, type: res.success ? "success" : "error" });
    
    if (res.success) {
      setSearchQuery("");
      setSearchResults([]);
      loadMembers();
    }
    setTimeout(() => setMessage(null), 3000);
  };

  // Lọc danh sách thành viên hiện tại theo filterQuery
  const filteredMembers = members.filter(m => 
    m.user.FullName?.toLowerCase().includes(filterQuery.toLowerCase()) ||
    m.user.Email?.toLowerCase().includes(filterQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[120] p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Thành viên dự án</h2>
            <p className="text-sm text-slate-500">Tìm kiếm và thêm nhân sự vào dự án.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Ô tìm kiếm Autocomplete */}
        <div className="p-6 border-b border-slate-100 bg-white relative">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Nhập tên hoặc email người cần mời..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-900 font-medium placeholder:text-slate-400"
            />
            <svg className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {isSearching && (
              <div className="absolute right-3 top-3.5">
                <svg className="animate-spin h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>

          {/* Kết quả tìm kiếm gợi ý */}
          {searchResults.length > 0 && (
            <div className="absolute left-6 right-6 mt-1 bg-white border border-slate-200 shadow-xl rounded-xl z-10 overflow-hidden animate-slide-up">
              {searchResults.map((user) => (
                <div key={user.Id} className="flex items-center justify-between p-3 hover:bg-slate-50 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                      {user.FullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{user.FullName}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user.Email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleInviteAction(user.Id)}
                    className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Mời
                  </button>
                </div>
              ))}
            </div>
          )}

          {message && (
            <p className={`mt-3 text-sm font-medium text-center ${message.type === "success" ? "text-green-600" : "text-red-500"}`}>
              {message.text}
            </p>
          )}
        </div>

        {/* Danh sách thành viên hiện tại */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thành viên ({members.length})</h3>
            
            {/* Ô lọc nhanh thành viên hiện có */}
            <div className="relative w-48">
              <input 
                type="text" 
                placeholder="Lọc tên..." 
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 transition-all"
              />
              <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center text-slate-400 py-8 animate-pulse">Đang tải...</div>
          ) : (
            <ul className="space-y-3">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((m, idx) => (
                  <li key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm animate-fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold shadow-sm">
                        {m.user.FullName?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 leading-tight">{m.user.FullName}</p>
                        <p className="text-xs text-slate-500">{m.user.Email}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      m.Role === "OWNER" || m.Role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600"
                    }`}>
                      {m.Role === "OWNER" ? "Chủ dự án" : m.Role === "ADMIN" ? "Quản lý" : "Thành viên"}
                    </span>
                  </li>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-sm italic">Không tìm thấy thành viên nào khớp.</div>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
