'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MOCK_PROJECTS } from '@/lib/mock';
import { Button } from '@/components/ui/Button';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import ProjectChat from '@/components/chat/ProjectChat';

export default function ProjectDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const project = MOCK_PROJECTS.find((p) => p.id === id);

    const [activeTab, setActiveTab] = useState<'board' | 'chat' | 'settings'>('board');

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Project Not Found</h2>
                <p className="text-slate-500 mb-6">The project you are looking for does not exist or has been removed.</p>
                <Link href="/dashboard/projects">
                    <Button>Back to Projects</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                        <Link href="/dashboard/projects" className="hover:text-slate-900 transition-colors">Projects</Link>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span>{project.name}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
                    <p className="text-slate-500 mt-2 max-w-2xl">{project.description}</p>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/meet/123" target="_blank">
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200">
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Join Meeting
                        </Button>
                    </Link>
                    <div className="h-8 w-px bg-slate-200 mx-1"></div>
                    <div className="flex -space-x-2 mr-2">
                        {project.team.map((avatar, i) => (
                            <img key={i} className="inline-block h-9 w-9 rounded-full ring-2 ring-white" src={avatar} alt="Team" />
                        ))}
                        <button className="flex items-center justify-center h-9 w-9 rounded-full ring-2 ring-white bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>
                    <Button variant="outline">Share</Button>
                    <Button>Edit Project</Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setActiveTab('board')}
                        className={`py-3 px-1 relative font-medium text-sm transition-colors ${activeTab === 'board' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        Kanban Board
                        {activeTab === 'board' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`py-3 px-1 relative font-medium text-sm transition-colors ${activeTab === 'chat' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        Team Chat
                        {activeTab === 'chat' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`py-3 px-1 relative font-medium text-sm transition-colors ${activeTab === 'settings' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        Settings
                        {activeTab === 'settings' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>}
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px] bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                {activeTab === 'board' && (
                    <div className="h-full">
                        <KanbanBoard />
                    </div>
                )}
                {activeTab === 'chat' && (
                    <ProjectChat />
                )}
                {activeTab === 'settings' && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-slate-50 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Project Settings</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">Manage project details, team members, permissions, and integrations.</p>
                        <Button className="mt-6" variant="outline">Manage Access</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
