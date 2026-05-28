'use client';

import { AppImage } from "@/components/ui/AppImage";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Left: Decorative Section */}
      <div className="hidden lg:flex flex-col justify-between bg-[#020617] text-white p-16 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-violet-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3 font-black text-3xl tracking-tighter">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">TaskFlow</span>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 space-y-10">
          <div className="space-y-4">
            <span className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-black uppercase tracking-widest">
              Phiên bản Enterprise 2026
            </span>
            <h1 className="text-5xl font-black leading-[1.1] tracking-tight">
              Quản trị vận hành <br /> 
              <span className="text-indigo-500">Thông minh & Đột phá.</span>
            </h1>
          </div>
          
          <div className="p-8 bg-white/[0.03] border border-white/5 backdrop-blur-xl rounded-[2rem] space-y-6 shadow-2xl">
            <p className="text-lg text-slate-300 leading-relaxed font-medium italic">
              "Hệ điều hành doanh nghiệp thế hệ mới giúp đội ngũ của chúng tôi tăng 40% năng suất lao động chỉ sau 3 tháng triển khai."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 p-0.5 shadow-lg">
                <AppImage
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                  alt="User"
                  fill
                  className="w-full h-full rounded-full border-2 border-[#020617]"
                  imageClassName="object-cover"
                  sizes="48px"
                />
              </div>
              <div>
                <div className="font-black text-white">Nguyễn Quốc Bình</div>
                <div className="text-xs text-indigo-400 font-bold uppercase tracking-wider">
                  CTO @ Enterprise TaskFlow
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs font-bold text-slate-500 tracking-widest uppercase">
          <span>© 2026 TaskFlow Inc.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Bảo mật</a>
            <a href="#" className="hover:text-white transition-colors">Điều khoản</a>
          </div>
        </div>
      </div>

      {/* Right: Form Section */}
      <div className="flex items-center justify-center p-8 bg-slate-50 lg:bg-white relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[100px] -z-10 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-50 rounded-full blur-[100px] -z-10 opacity-50"></div>
        
        <div className="w-full max-w-md animate-fade-in">
          {children}
        </div>
      </div>
    </div>
  );
}
