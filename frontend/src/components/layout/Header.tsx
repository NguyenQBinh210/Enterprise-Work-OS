import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

export default function Header() {
    return (
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 fixed top-0 right-0 left-0 md:left-64 z-40 px-6 flex items-center justify-between">
            {/* Project Info */}
            <div className="flex items-center gap-4">
                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                    Active Project
                </span>
                <h1 className="text-lg font-semibold text-slate-800">
                    Enterprise Migration
                </h1>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
                <LanguageSwitcher />

                <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors relative">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>
                <div className="h-8 w-px bg-slate-200 mx-1"></div>
                <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                    <span className="text-sm font-medium text-slate-700 hidden sm:block">Quốc Bình</span>
                    <div className="w-9 h-9 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                    </div>
                </div>
            </div>
        </header>
    );
}
