import { Button } from "@/components/ui/Button";

type DeleteTaskConfirmProps = {
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteTaskConfirm({ loading, onCancel, onConfirm }: DeleteTaskConfirmProps) {
  return (
    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-200 flex items-center justify-center animate-in fade-in zoom-in duration-200">
      <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-xl max-w-md text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Xác nhận xóa?</h3>
        <p className="text-slate-500 mb-6 text-sm">
          Hành động này không thể hoàn tác. Nhiệm vụ sẽ bị gỡ bỏ hoàn toàn khỏi dự án.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="ghost" onClick={onCancel} disabled={loading}>Hủy bỏ</Button>
          <Button onClick={onConfirm} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white px-8">
            Xóa ngay
          </Button>
        </div>
      </div>
    </div>
  );
}
