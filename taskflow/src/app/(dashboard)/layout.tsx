'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 relative">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <Header onMenuClick={() => setIsSidebarOpen(true)} />
            <main className="ml-0 md:ml-20 pt-16 min-h-screen transition-all duration-300 ease-in-out">
                {children}
            </main>
        </div>
    );
}
