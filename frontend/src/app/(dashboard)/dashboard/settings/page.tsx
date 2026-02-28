'use client';

import { useState } from 'react';
import { MOCK_USERS, User } from '@/lib/mock';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
    const [users, setUsers] = useState<User[]>(MOCK_USERS);

    const handleRoleChange = (userId: string, newRole: User['role']) => {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    };

    const handleStatusToggle = (userId: string) => {
        setUsers(users.map(u =>
            u.id === userId ? { ...u, status: u.status === 'Active' ? 'Disabled' : 'Active' } : u
        ));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                    <p className="text-slate-500 mt-1">Manage workspace members and permissions.</p>
                </div>
                <Button>Invite Member</Button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold">User</th>
                                <th className="px-6 py-4 font-semibold">Role</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full ring-2 ring-white" />
                                            <div>
                                                <div className="font-medium text-slate-900">{user.name}</div>
                                                <div className="text-slate-500 text-xs">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value as User['role'])}
                                            className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-24 p-1.5 outline-none"
                                        >
                                            <option value="Admin">Admin</option>
                                            <option value="Editor">Editor</option>
                                            <option value="Viewer">Viewer</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                                    ${user.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}
                                        >
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleStatusToggle(user.id)}
                                                className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors
                                            ${user.status === 'Active'
                                                        ? 'border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                                        : 'border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}
                                            >
                                                {user.status === 'Active' ? 'Disable' : 'Enable'}
                                            </button>
                                            <button className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
