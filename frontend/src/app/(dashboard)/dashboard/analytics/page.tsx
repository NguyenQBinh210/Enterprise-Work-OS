import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import AnalyticsClient, { type AnalyticsData } from "@/components/analytics/AnalyticsClient";

export const dynamic = "force-dynamic";

type TaskRow = {
  Id: string;
  Title: string;
  Status: string | null;
  Priority: string | null;
  Deadline: string | null;
  CompletedAt?: string | null;
  CreatedAt: string | null;
  GroupId: string | null;
  Project?: { Name?: string | null } | null;
};

export default async function AnalyticsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const { data: userData } = await supabase
    .from("Users")
    .select("Id, FullName")
    .eq("Email", session?.user?.email)
    .single();

  if (!userData?.Id) {
    return <div className="p-8 text-sm font-semibold text-slate-500">Vui lòng đăng nhập lại.</div>;
  }

  const { data: memberships } = await supabase
    .from("GroupMembers")
    .select("GroupId")
    .eq("UserId", userData.Id);

  const groupIds = memberships?.map((item) => item.GroupId).filter(Boolean) || [];

  const [{ data: assignments }, { data: projectTasks }, { data: members }] = await Promise.all([
    supabase.from("TaskAssignees").select("TaskId").eq("UserId", userData.Id),
    groupIds.length
      ? supabase
          .from("Tasks")
          .select("Id, Title, Status, Priority, Deadline, CompletedAt, CreatedAt, GroupId, Project:GroupId(Name)")
          .in("GroupId", groupIds)
          .eq("IsDeleted", false)
      : Promise.resolve({ data: [] }),
    groupIds.length
      ? supabase
          .from("GroupMembers")
          .select("UserId, GroupId, Users(FullName)")
          .in("GroupId", groupIds)
      : Promise.resolve({ data: [] }),
  ]);

  const assignedIds = assignments?.map((item) => item.TaskId) || [];
  const allTasks = ((projectTasks || []) as unknown as TaskRow[]);
  const personalTasks = allTasks.filter((task) => assignedIds.includes(task.Id));
  const allTaskIds = allTasks.map((task) => task.Id);
  const { data: taskAssignees } = allTaskIds.length
    ? await supabase.from("TaskAssignees").select("TaskId, UserId").in("TaskId", allTaskIds)
    : { data: [] };

  const countByStatus = (tasks: TaskRow[], status: string) => tasks.filter((task) => task.Status === status).length;
  const personalDone = countByStatus(personalTasks, "DONE");
  const projectDone = countByStatus(allTasks, "DONE");
  const personalRate = personalTasks.length ? Math.round((personalDone / personalTasks.length) * 100) : 0;
  const projectRate = allTasks.length ? Math.round((projectDone / allTasks.length) * 100) : 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdue = personalTasks.filter((task) => {
    if (!task.Deadline || task.Status === "DONE") return false;
    const deadline = new Date(task.Deadline);
    deadline.setHours(0, 0, 0, 0);
    return deadline < today;
  }).length;

  const statusData = [
    { name: "Cần làm", value: countByStatus(allTasks, "TODO"), color: "#64748b" },
    { name: "Đang làm", value: countByStatus(allTasks, "IN_PROGRESS"), color: "#3b82f6" },
    { name: "Hoàn thành", value: projectDone, color: "#10b981" },
  ];

  const priorityData = [
    { name: "Cao", value: allTasks.filter((task) => task.Priority === "HIGH").length, color: "#ef4444" },
    { name: "Thường", value: allTasks.filter((task) => !task.Priority || task.Priority === "NORMAL").length, color: "#3b82f6" },
    { name: "Thấp", value: allTasks.filter((task) => task.Priority === "LOW").length, color: "#94a3b8" },
  ];

  const weeklyDoneData = Array.from({ length: 7 }).map((_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - index));
    const key = day.toISOString().slice(0, 10);
    return {
      name: day.toLocaleDateString("vi-VN", { weekday: "short" }),
      value: allTasks.filter((task) => task.CompletedAt?.slice(0, 10) === key).length,
    };
  });

  const progressByProject = new Map<string, { total: number; done: number }>();
  allTasks.forEach((task) => {
    const name = task.Project?.Name || "Không tên";
    const current = progressByProject.get(name) || { total: 0, done: 0 };
    current.total += 1;
    if (task.Status === "DONE") current.done += 1;
    progressByProject.set(name, current);
  });

  const memberMap = new Map<string, { name: string; total: number; done: number }>();
  (members || []).forEach((member: any) => {
    const name = member.Users?.FullName || "Thành viên";
    memberMap.set(member.UserId, { name, total: 0, done: 0 });
  });
  const taskById = new Map(allTasks.map((task) => [task.Id, task]));
  (taskAssignees || []).forEach((assignee: any) => {
    const task = taskById.get(assignee.TaskId);
    const member = memberMap.get(assignee.UserId);
    if (!task || !member) return;
    member.total += 1;
    if (task.Status === "DONE") member.done += 1;
  });

  const attentionTasks = personalTasks
    .filter((task) => task.Status !== "DONE")
    .filter((task) => task.Priority === "HIGH" || task.Deadline)
    .sort((a, b) => new Date(a.Deadline || "9999-12-31").getTime() - new Date(b.Deadline || "9999-12-31").getTime())
    .slice(0, 6)
    .map((task) => ({
      id: task.Id,
      title: task.Title,
      project: task.Project?.Name || "Không tên",
      deadline: task.Deadline,
      priority: task.Priority,
      status: task.Status || "TODO",
    }));

  const data: AnalyticsData = {
    personalCards: [
      { label: "Việc được giao", value: personalTasks.length, hint: "Từ các dự án bạn tham gia" },
      { label: "Đã hoàn thành", value: personalDone, hint: `${personalRate}% tiến độ cá nhân` },
      { label: "Đang xử lý", value: countByStatus(personalTasks, "IN_PROGRESS"), hint: "Cần cập nhật thường xuyên" },
      { label: "Quá hạn", value: overdue, hint: "Cần ưu tiên xử lý" },
    ],
    projectCards: [
      { label: "Dự án tham gia", value: groupIds.length, hint: "Tổng workspace/project" },
      { label: "Tổng công việc", value: allTasks.length, hint: "Trong các dự án của bạn" },
      { label: "Hoàn thành", value: projectDone, hint: `${projectRate}% tiến độ chung` },
      { label: "Việc ưu tiên cao", value: allTasks.filter((task) => task.Priority === "HIGH").length, hint: "Theo cột Priority" },
    ],
    statusData,
    priorityData,
    weeklyDoneData,
    projectProgressData: Array.from(progressByProject.entries()).slice(0, 6).map(([name, value]) => ({
      name,
      value: value.total ? Math.round((value.done / value.total) * 100) : 0,
    })),
    memberStats: Array.from(memberMap.values()).slice(0, 6).map((member) => ({
      ...member,
      rate: member.total ? Math.round((member.done / member.total) * 100) : 0,
    })),
    attentionTasks,
  };

  return <AnalyticsClient data={data} />;
}
