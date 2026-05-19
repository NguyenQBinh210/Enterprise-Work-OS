"use client";

import { useState } from "react";
import ProjectMembersModal from "./ProjectMembersModal";
import ProjectSettingsModal from "./ProjectSettingsModal";

type ProjectHeaderGroup = {
  id: string;
  name: string;
  description?: string | null;
};

type ProjectHeaderUser = {
  SystemRole?: string | null;
} | null;

export default function ProjectHeader({
  group,
  currentUser,
}: {
  group: ProjectHeaderGroup;
  currentUser: ProjectHeaderUser;
}) {
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const role = currentUser?.SystemRole?.toUpperCase();
  const canManage = role === "ADMIN" || role === "MANAGER";

  return (
    <div className="mb-4 flex flex-col justify-between gap-4 sm:mb-6 sm:flex-row sm:items-center">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold leading-tight text-slate-950 sm:text-2xl md:text-[28px]">
          {group.name}
        </h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500 sm:text-[15px]">
          {group.description}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {canManage && (
          <>
            <button
              onClick={() => setIsMembersModalOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-blue-300 hover:bg-slate-50 hover:text-blue-600 active:scale-95 sm:px-4"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Thành viên
            </button>

            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition-all hover:border-blue-300 hover:bg-slate-50 hover:text-blue-600 active:scale-95"
              title="Cài đặt dự án"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </>
        )}
      </div>

      <ProjectMembersModal
        groupId={group.id}
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
      />

      <ProjectSettingsModal
        group={group}
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
}
