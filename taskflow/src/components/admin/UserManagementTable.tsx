"use client";

import { useState, useEffect, useRef } from "react";
import { getUsers, updateUserRole, getUserLogs, updateUserInfo, updateUserPassword, toggleUserStatus } from "@/actions/admin.actions";

// ─── Cấu hình 3 cấp phân quyền ───────────────────────────────────────────────
const ROLES = [
  {
    value: "ADMIN",
    label: "Admin",
    description: "Toàn quyền hệ thống",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
    hoverBg: "hover:bg-purple-50",
    textColor: "text-purple-700",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    value: "MANAGER",
    label: "Manager",
    description: "Quản lý dự án & nhóm",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    hoverBg: "hover:bg-blue-50",
    textColor: "text-blue-700",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    value: "MEMBER",
    label: "Member",
    description: "Thành viên thông thường",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    hoverBg: "hover:bg-emerald-50",
    textColor: "text-emerald-700",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    value: "VIEWER",
    label: "Viewer",
    description: "Chỉ xem, không thao tác",
    color: "bg-slate-50 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
    hoverBg: "hover:bg-slate-50",
    textColor: "text-slate-600",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
] as const;

type RoleValue = "ADMIN" | "MANAGER" | "MEMBER" | "VIEWER";

function getRoleConfig(roleValue: string) {
  return ROLES.find(r => r.value === roleValue?.toUpperCase()) ?? ROLES[2];
}

// ─── Toast Notification ────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border animate-slide-up ${type === "success"
        ? "bg-white border-emerald-200 text-emerald-700"
        : "bg-white border-red-200 text-red-600"
      }`}>
      {type === "success" ? (
        <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

// ─── Role Dropdown ─────────────────────────────────────────────────────────────
function RoleDropdown({
  userId,
  currentRole,
  onRoleChange,
  saving,
}: {
  userId: string;
  currentRole: string;
  onRoleChange: (userId: string, newRole: string) => Promise<void>;
  saving: string | null;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cfg = getRoleConfig(currentRole);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* Badge hiện tại — click để mở dropdown */}
      <button
        onClick={() => setOpen(!open)}
        disabled={saving === userId}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-sm ${cfg.color} hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed`}
        title="Nhấp để đổi quyền"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {saving === userId ? (
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <>
            {cfg.label}
            <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute top-full mt-2 left-0 z-30 w-52 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden animate-fade-in">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border-b border-slate-100">
            Chọn phân quyền
          </div>

          {ROLES.map((role) => {
            const isActive = role.value === currentRole?.toUpperCase();
            return (
              <button
                key={role.value}
                onClick={async () => {
                  setOpen(false);
                  if (!isActive) await onRoleChange(userId, role.value);
                }}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${role.hoverBg} ${isActive ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                disabled={isActive}
              >
                <span className={role.textColor}>{role.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${role.textColor}`}>{role.label}</p>
                  <p className="text-xs text-slate-400 truncate">{role.description}</p>
                </div>
                {isActive && (
                  <svg className={`w-4 h-4 shrink-0 ${role.textColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Table Component ──────────────────────────────────────────────────────
export default function UserManagementTable() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // State modal xem log
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // State modal chỉnh sửa
  const [editingUser, setEditingUser] = useState<any>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const data = await getUsers();
    setUsers(data || []);
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setSavingUserId(userId);

    // Optimistic update ngay lập tức
    setUsers(prev => prev.map(u => u.Id === userId ? { ...u, SystemRole: newRole } : u));

    // Lưu vào Database
    const success = await updateUserRole(userId, newRole);

    setSavingUserId(null);
    if (success) {
      setToast({ message: `Đã cập nhật quyền → ${newRole} thành công!`, type: "success" });
    } else {
      // Rollback nếu lỗi
      fetchUsers();
      setToast({ message: "Lỗi: Không thể cập nhật quyền. Kiểm tra RLS Supabase.", type: "error" });
    }
  };

  const viewLogs = async (user: any) => {
    setSelectedUser(user);
    setLogsLoading(true);
    setLogs([]);
    const userLogs = await getUserLogs(user.Id);
    setLogs(userLogs);
    setLogsLoading(false);
  };

  const handleUpdateUser = async (userId: string, data: { fullName?: string, password?: string, isDisabled?: boolean, email?: string }) => {
    setSavingUserId(userId);
    let success = true;

    if (data.fullName) {
      const res = await updateUserInfo(userId, data.fullName);
      if (!res.success) success = false;
    }

    if (data.password && data.email) {
      const res = await updateUserPassword(data.email, data.password);
      if (!res.success) {
        setToast({ message: res.message || "Lỗi đổi mật khẩu", type: "error" });
        success = false;
      }
    }

    if (data.isDisabled !== undefined) {
      const res = await toggleUserStatus(userId, data.isDisabled);
      if (!res.success) success = false;
    }

    setSavingUserId(null);
    if (success) {
      setToast({ message: "Cập nhật tài khoản thành công!", type: "success" });
      fetchUsers();
      setEditingUser(null);
    } else if (!toast) {
      setToast({ message: "Có lỗi xảy ra khi cập nhật.", type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center gap-3 text-slate-400">
        <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm">Đang tải danh sách nhân sự...</p>
      </div>
    );
  }

  return (
    <>
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Summary bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-sm text-slate-600">
            Tổng cộng: <strong className="text-slate-900">{users.length}</strong> tài khoản
          </span>
          <div className="flex items-center gap-3">
            {ROLES.map(r => {
              const count = users.filter(u => u.SystemRole?.toUpperCase() === r.value).length;
              return (
                <span key={r.value} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${r.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${r.dot}`} />
                  {r.label}: {count}
                </span>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-3 font-semibold">Tài khoản</th>
                <th className="px-6 py-3 font-semibold">Email</th>
                <th className="px-6 py-3 font-semibold text-center">Phân quyền</th>
                <th className="px-6 py-3 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-sm font-medium text-slate-500">Chưa có dữ liệu</p>
                      <p className="text-xs text-slate-400">Kiểm tra kết nối Supabase hoặc cài đặt RLS</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const roleCfg = getRoleConfig(user.SystemRole);
                  return (
                    <tr key={user.Id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Avatar + Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-sm bg-gradient-to-br ${user.SystemRole?.toUpperCase() === "ADMIN"
                              ? "from-purple-500 to-purple-700"
                              : user.SystemRole?.toUpperCase() === "MANAGER"
                                ? "from-blue-500 to-blue-700"
                                : "from-slate-400 to-slate-600"
                            }`}>
                            {user.FullName ? user.FullName.charAt(0).toUpperCase() : "?"}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{user.FullName || "Chưa cập nhật tên"}</p>
                            <p className="text-xs text-slate-400">ID: {user.Id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-slate-600 text-sm">{user.Email || "—"}</td>

                      {/* Role Dropdown (Phân quyền) */}
                      <td className="px-6 py-4">
                        <RoleDropdown
                          userId={user.Id}
                          currentRole={user.SystemRole || "MEMBER"}
                          onRoleChange={handleRoleChange}
                          saving={savingUserId}
                        />
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                            title="Chỉnh sửa"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => viewLogs(user)}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                            title="Xem Log"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Modal Log ─────────────────────────────────────────────────────────── */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm bg-gradient-to-br ${selectedUser.SystemRole?.toUpperCase() === "ADMIN"
                    ? "from-purple-500 to-purple-700"
                    : selectedUser.SystemRole?.toUpperCase() === "MANAGER"
                      ? "from-blue-500 to-blue-700"
                      : "from-slate-400 to-slate-600"
                  }`}>
                  {selectedUser.FullName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">{selectedUser.FullName}</h3>
                  <p className="text-xs text-slate-500">Nhật ký hoạt động hệ thống</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-5 max-h-80 overflow-y-auto">
              {logsLoading ? (
                <div className="flex justify-center py-8">
                  <svg className="w-6 h-6 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              ) : logs.length > 0 ? (
                <ul className="space-y-3">
                  {logs.map((log: any, index: number) => (
                    <li key={index} className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl">
                      <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800">{log.Action}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(log.CreatedAt).toLocaleString("vi-VN")}
                          {log.Details && <span className="ml-1 text-slate-500">— {log.Details}</span>}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <svg className="w-10 h-10 mx-auto mb-2 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-sm">Chưa có nhật ký hoạt động</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Chỉnh sửa */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleUpdateUser}
          loading={savingUserId === editingUser.Id}
        />
      )}
    </>
  );
}

// ─── Modal Chỉnh sửa Tài khoản ──────────────────────────────────────────────────
function EditUserModal({ user, onClose, onSave, loading }: any) {
  const [fullName, setFullName] = useState(user.FullName || "");
  const [password, setPassword] = useState("");
  const [isDisabled, setIsDisabled] = useState(user.IsDisabled || false);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Chỉnh sửa tài khoản</h3>
            <p className="text-sm text-slate-500 mt-1">{user.Email}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Tên hiển thị */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Tên hiển thị</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm font-bold text-black"
              placeholder="Nhập tên nhân viên..."
            />
          </div>

          {/* Đổi mật khẩu */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Mật khẩu mới</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm font-bold text-black"
              placeholder="Để trống nếu không muốn đổi..."
            />
            <p className="text-[10px] text-slate-400 ml-1 italic">* Yêu cầu quyền Service Role để thực thi trực tiếp.</p>
          </div>

          {/* Trạng thái tài khoản */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDisabled ? 'bg-red-100' : 'bg-emerald-100'}`}>
                  {isDisabled ? (
                    <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Trạng thái tài khoản</p>
                  <p className="text-xs text-slate-500">{isDisabled ? 'Đang bị khóa' : 'Đang hoạt động'}</p>
                </div>
              </div>
              <button
                onClick={() => setIsDisabled(!isDisabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isDisabled ? 'bg-red-500' : 'bg-emerald-500'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDisabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-all"
          >
            Hủy
          </button>
          <button
            disabled={loading}
            onClick={() => onSave(user.Id, { fullName, password, isDisabled, email: user.Email })}
            className="flex-[2] px-4 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}
