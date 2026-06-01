export function getDeadlineState(deadline?: string | null) {
  if (!deadline) return { label: "Không có hạn", urgent: false, overdue: false };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dl = new Date(deadline);
  dl.setHours(0, 0, 0, 0);
  const diff = Math.round((dl.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diff < 0) return { label: `Quá hạn ${Math.abs(diff)} ngày`, urgent: true, overdue: true };
  if (diff === 0) return { label: "Hôm nay", urgent: true, overdue: false };
  if (diff <= 2) return { label: `Còn ${diff} ngày`, urgent: true, overdue: false };

  return {
    label: dl.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
    urgent: false,
    overdue: false,
  };
}
