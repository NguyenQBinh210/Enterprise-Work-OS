"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type StatCard = {
  label: string;
  value: string | number;
  hint: string;
};

type ChartPoint = {
  name: string;
  value: number;
  color?: string;
};

type MemberStat = {
  name: string;
  total: number;
  done: number;
  rate: number;
};

type AttentionTask = {
  id: string;
  title: string;
  project: string;
  deadline: string | null;
  priority: string | null;
  status: string;
};

export type AnalyticsData = {
  personalCards: StatCard[];
  projectCards: StatCard[];
  statusData: ChartPoint[];
  priorityData: ChartPoint[];
  weeklyDoneData: ChartPoint[];
  projectProgressData: ChartPoint[];
  memberStats: MemberStat[];
  attentionTasks: AttentionTask[];
};

const STATUS_COLORS = ["#3b82f6", "#f59e0b", "#10b981"];

export default function AnalyticsClient({ data }: { data: AnalyticsData }) {
  return (
    <div className="space-y-8 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Thống kê</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">Tổng quan hiệu suất cá nhân và tiến độ dự án.</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wide text-slate-500">Cá nhân</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {data.personalCards.map((card) => (
            <StatCardView key={card.label} card={card} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wide text-slate-500">Dự án</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {data.projectCards.map((card) => (
            <StatCardView key={card.label} card={card} />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="Công việc theo trạng thái">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={data.statusData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={4}>
                {data.statusData.map((entry, index) => (
                  <Cell key={entry.name} fill={entry.color || STATUS_COLORS[index % STATUS_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Mức ưu tiên">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.priorityData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {data.priorityData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color || "#64748b"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Hoàn thành trong 7 ngày">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.weeklyDoneData}>
              <defs>
                <linearGradient id="doneGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} fill="url(#doneGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Tiến độ theo dự án">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.projectProgressData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
              <YAxis dataKey="name" type="category" width={110} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="value" fill="#10b981" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-black text-slate-900">Hiệu suất thành viên</h3>
          <div className="space-y-3">
            {data.memberStats.map((member) => (
              <div key={member.name} className="rounded-xl border border-slate-100 p-3">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-800">{member.name}</span>
                  <span className="font-black text-blue-600">{member.rate}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${member.rate}%` }} />
                </div>
                <p className="mt-2 text-xs font-medium text-slate-400">{member.done}/{member.total} công việc đã xong</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-black text-slate-900">Cần chú ý</h3>
          <div className="space-y-3">
            {data.attentionTasks.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-400">Không có công việc cần cảnh báo.</p>
            ) : data.attentionTasks.map((task) => (
              <div key={task.id} className="rounded-xl border border-slate-100 p-3">
                <p className="truncate text-sm font-bold text-slate-800">{task.title}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold text-slate-500">
                  <span className="rounded-lg bg-slate-100 px-2 py-1">{task.project}</span>
                  <span className="rounded-lg bg-amber-50 px-2 py-1 text-amber-700">{task.priority || "NORMAL"}</span>
                  <span className="rounded-lg bg-red-50 px-2 py-1 text-red-600">
                    {task.deadline ? new Date(task.deadline).toLocaleDateString("vi-VN") : "Chưa có hạn"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCardView({ card }: { card: StatCard }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">{card.label}</p>
      <p className="mt-3 text-3xl font-black text-slate-900">{card.value}</p>
      <p className="mt-1 text-xs font-semibold text-slate-500">{card.hint}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-base font-black text-slate-900">{title}</h3>
      {children}
    </div>
  );
}
