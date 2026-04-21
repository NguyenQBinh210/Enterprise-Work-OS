'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const RECENT_MEETINGS = [
    { id: 'standup-1', title: 'Weekly Standup', time: 'Today, 15:00', participants: 4, duration: '25 min', status: 'live' },
    { id: 'review-1', title: 'Sprint Review', time: 'Yesterday, 14:00', participants: 6, duration: '45 min', status: 'ended' },
    { id: 'design-1', title: 'Design Sync', time: 'Mar 4, 10:30', participants: 3, duration: '30 min', status: 'ended' },
    { id: 'plan-1', title: 'Q2 Planning', time: 'Mar 3, 09:00', participants: 8, duration: '1h 15min', status: 'ended' },
];

const SCHEDULED_MEETINGS = [
    { id: 'retro-1', title: 'Sprint Retrospective', time: 'Tomorrow, 16:00', participants: 5 },
    { id: 'onboard-1', title: 'New Member Onboarding', time: 'Mar 8, 10:00', participants: 3 },
    { id: 'demo-1', title: 'Product Demo', time: 'Mar 10, 14:00', participants: 12 },
];

export default function MeetingsPage() {
    const { t } = useLanguage();
    const [meetingCode, setMeetingCode] = useState('');
    const [showNewMeeting, setShowNewMeeting] = useState(false);
    const [newMeetingTitle, setNewMeetingTitle] = useState('');

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Video Meetings</h1>
                <p className="text-slate-500 mt-1">Start or join a video call with your team.</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* New Meeting */}
                <button
                    onClick={() => setShowNewMeeting(true)}
                    className="group relative bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-6 rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 text-left overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500" />
                    <div className="relative">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-lg">New Meeting</h3>
                        <p className="text-blue-100 text-sm mt-1">Start an instant meeting</p>
                    </div>
                </button>

                {/* Join Meeting */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-3">Join Meeting</h3>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={meetingCode}
                            onChange={(e) => setMeetingCode(e.target.value)}
                            placeholder="Enter meeting code"
                            className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        />
                        <Link
                            href={`/meet/${meetingCode || 'standup-1'}`}
                            className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
                        >
                            Join
                        </Link>
                    </div>
                </div>

                {/* Schedule */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-1">Schedule</h3>
                    <p className="text-slate-500 text-sm">Plan a meeting for later</p>
                </div>
            </div>

            {/* New Meeting Modal */}
            {showNewMeeting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-slide-up">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Start New Meeting</h3>
                        <p className="text-slate-500 text-sm mb-6">Create a new meeting room and invite your team.</p>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Meeting Title</label>
                                <input
                                    type="text"
                                    value={newMeetingTitle}
                                    onChange={(e) => setNewMeetingTitle(e.target.value)}
                                    placeholder="e.g. Weekly Standup"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-blue-900">Meeting Link</p>
                                    <p className="text-xs text-blue-600 truncate">workos.app/meet/new-meeting-{Date.now().toString(36)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowNewMeeting(false)}
                                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <Link
                                href="/meet/new-meeting"
                                className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors text-center shadow-lg shadow-blue-500/20"
                            >
                                Start Now
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Meetings */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="font-bold text-slate-900">Recent Meetings</h2>
                        <span className="text-xs text-slate-400">{RECENT_MEETINGS.length} meetings</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {RECENT_MEETINGS.map((meeting) => (
                            <div key={meeting.id} className="px-6 py-4 hover:bg-slate-50 transition-colors group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${meeting.status === 'live'
                                                ? 'bg-red-50 text-red-500'
                                                : 'bg-slate-100 text-slate-400'
                                            }`}>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-slate-900 text-sm">{meeting.title}</h3>
                                                {meeting.status === 'live' && (
                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                                        LIVE
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <span className="text-xs text-slate-400">{meeting.time}</span>
                                                <span className="text-xs text-slate-400">·</span>
                                                <span className="text-xs text-slate-400">{meeting.participants} participants</span>
                                                <span className="text-xs text-slate-400">·</span>
                                                <span className="text-xs text-slate-400">{meeting.duration}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {meeting.status === 'live' && (
                                        <Link
                                            href={`/meet/${meeting.id}`}
                                            className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            Rejoin
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Scheduled Meetings */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="font-bold text-slate-900">Upcoming Meetings</h2>
                        <span className="text-xs text-slate-400">{SCHEDULED_MEETINGS.length} scheduled</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {SCHEDULED_MEETINGS.map((meeting) => (
                            <div key={meeting.id} className="px-6 py-4 hover:bg-slate-50 transition-colors group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 text-sm">{meeting.title}</h3>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <span className="text-xs text-slate-400">{meeting.time}</span>
                                                <span className="text-xs text-slate-400">·</span>
                                                <span className="text-xs text-slate-400">{meeting.participants} invited</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/meet/${meeting.id}`}
                                        className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        Start
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
