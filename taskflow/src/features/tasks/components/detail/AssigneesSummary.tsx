import { X } from "lucide-react";

type AssigneeUser = {
  FullName?: string | null;
  Email?: string | null;
};

type Assignee = {
  UserId: string;
  user?: AssigneeUser;
};

type AssigneesSummaryProps = {
  assignees: Assignee[];
  canManageTask: boolean;
  onToggleAssignee: (userId: string, user: AssigneeUser | undefined) => void;
};

export function AssigneesSummary({ assignees, canManageTask, onToggleAssignee }: AssigneesSummaryProps) {
  return (
    <div className="border-t border-slate-100 pt-10">
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        Đội ngũ thực hiện ({assignees.length})
      </h3>
      <div className="flex flex-wrap gap-4">
        {assignees.map((a, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl group transition-all hover:bg-white hover:shadow-lg hover:border-blue-100">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-sm font-black shadow-lg shadow-blue-600/20">
              {a.user?.FullName?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 leading-none">{a.user?.FullName}</p>
              <p className="text-[10px] text-slate-400 mt-1 font-bold">@{a.user?.Email?.split("@")[0]}</p>
            </div>
            {canManageTask && (
              <button onClick={() => onToggleAssignee(a.UserId, a.user)} className="ml-3 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        {assignees.length === 0 && <p className="text-sm text-slate-400 italic font-medium">Chưa có ai được giao nhiệm vụ này.</p>}
      </div>
    </div>
  );
}
