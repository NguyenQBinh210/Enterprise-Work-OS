import VideoGrid from '@/components/meet/VideoGrid';
import ControlBar from '@/components/meet/ControlBar';

export default function MeetingPage() {
    return (
        <div className="h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Top Info */}
            <div className="absolute top-6 left-6 z-10">
                <h1 className="text-white font-semibold text-lg flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    Weekly Standup
                    <span className="text-slate-400 text-sm font-normal px-2">|</span>
                    <span className="text-slate-400 text-sm font-normal">00:15:24</span>
                </h1>
            </div>

            <VideoGrid />
            <ControlBar />
        </div>
    );
}
