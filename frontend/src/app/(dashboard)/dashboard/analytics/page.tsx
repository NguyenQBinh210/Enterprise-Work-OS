'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    AreaChart,
    Area
} from 'recharts';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function AnalyticsPage() {
    const { t } = useLanguage();

    // Mock Data
    const weeklyActivityData = [
        { name: 'Mon', tasks: 12, hours: 6 },
        { name: 'Tue', tasks: 19, hours: 8 },
        { name: 'Wed', tasks: 15, hours: 7 },
        { name: 'Thu', tasks: 22, hours: 9 },
        { name: 'Fri', tasks: 18, hours: 8 },
        { name: 'Sat', tasks: 8, hours: 4 },
        { name: 'Sun', tasks: 5, hours: 3 },
    ];

    const projectStatusData = [
        { name: 'Completed', value: 35, color: '#10b981' }, // Emerald
        { name: 'In Progress', value: 45, color: '#3b82f6' }, // Blue
        { name: 'Planning', value: 15, color: '#a855f7' },   // Purple
        { name: 'On Hold', value: 5, color: '#94a3b8' },    // Slate
    ];

    const efficiencyData = [
        { name: 'Week 1', score: 65 },
        { name: 'Week 2', score: 72 },
        { name: 'Week 3', score: 68 },
        { name: 'Week 4', score: 85 },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
                    <p className="text-slate-500 mt-1">Overview of your team's performance and project statistics.</p>
                </div>
                <div className="flex gap-2">
                    <select className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg p-2.5 outline-none focus:border-blue-500">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>This Month</option>
                        <option>This Year</option>
                    </select>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Tasks', value: '1,284', change: '+12%', color: 'blue' },
                    { label: 'Completed', value: '892', change: '+8%', color: 'emerald' },
                    { label: 'Hours Tracked', value: '3,450', change: '+5%', color: 'purple' },
                    { label: 'Efficiency', value: '94%', change: '+2%', color: 'orange' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                        <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                        <div className="flex items-end justify-between mt-2">
                            <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-${stat.color}-50 text-${stat.color}-600`}>
                                {stat.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Weekly Activity Bar Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Weekly Activity</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyActivityData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#f1f5f9' }}
                                />
                                <Bar dataKey="tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Tasks Completed" />
                                <Bar dataKey="hours" fill="#a855f7" radius={[4, 4, 0, 0]} name="Hours Spent" />
                                <Legend />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Project Status Pie Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Project Status</h3>
                    <div className="h-80 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={projectStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {projectStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Efficiency Trend Area Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm lg:col-span-2">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Team Efficiency Trend</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={efficiencyData}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}
