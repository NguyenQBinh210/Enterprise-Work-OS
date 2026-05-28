import { Paperclip } from "lucide-react";

type RelatedFile = {
  url: string;
  name: string;
  createdAt?: string;
  sender?: string;
};

type RelatedFilesPanelProps = {
  files: RelatedFile[];
};

export function RelatedFilesPanel({ files }: RelatedFilesPanelProps) {
  return (
    <div className="border-t border-slate-100 pt-10 mt-10">
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
          <Paperclip className="w-4 h-4 text-amber-600" />
        </div>
        Tài liệu liên quan ({files.length})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {files.map((file, i) => {
          const downloadUrl = file.url.replace("/upload/", "/upload/fl_attachment/");
          return (
            <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-white hover:shadow-xl hover:border-amber-200 transition-all">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-amber-600 shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                <Paperclip className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-sm font-black text-slate-900 truncate mb-1">{file.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gửi bởi {file.sender}</p>
              </div>
              <a
                href={downloadUrl}
                download={file.name}
                className="p-3 bg-white text-slate-400 hover:text-amber-600 rounded-xl border border-slate-100 shadow-sm transition-all active:scale-90"
                title="Tải xuống tài liệu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
            </div>
          );
        })}
        {files.length === 0 && (
          <div className="md:col-span-2 py-8 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400">
            <p className="text-xs font-bold uppercase tracking-widest">Chưa có tài liệu đính kèm</p>
          </div>
        )}
      </div>
    </div>
  );
}
