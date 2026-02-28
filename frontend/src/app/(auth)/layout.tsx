export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
      <div className="min-h-screen grid lg:grid-cols-2">
        {/* Left: Decorative Section */}
        <div className="hidden lg:flex flex-col justify-between bg-slate-900 text-white p-12 relative overflow-hidden">
          {/* Background Patterns */}
          <div className="absolute inset-0 z-0 opacity-20">
            <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-blue-500 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-purple-500 rounded-full blur-[120px] animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10 flex items-center gap-2 font-bold text-2xl tracking-tight">
            <svg
              className="w-8 h-8 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <span>WorkOS</span>
          </div>

          <div className="relative z-10 space-y-6 max-w-lg">
            <blockquote className="text-2xl font-medium leading-relaxed">
              WorkOS has completely transformed how our team collaborates. The
              project tracking and communication tools are top-notch.
            </blockquote>
            <div className="flex items-center gap-3">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                alt="User"
                className="w-10 h-10 rounded-full border-2 border-white/20"
              />
              <div>
                <div className="font-semibold">Nguyễn Quốc Bình</div>
                <div className="text-sm text-slate-400">
                  Head of Product, TechCorp
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-sm text-slate-500">
            © 2026 Enterprise WorkOS Inc.
          </div>
        </div>

        {/* Right: Form Section */}
        <div className="flex items-center justify-center p-8 bg-slate-50 lg:bg-white">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    );
}
