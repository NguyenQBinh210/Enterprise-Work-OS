'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault(); // Ngăn trang bị reload
        setLoading(true);
        setError(null);

        // Khởi tạo Supabase Client
        const supabase = createClient();
        
        // Gọi API Đăng nhập
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message); // Hiển thị lỗi (ví dụ: Sai mật khẩu)
            setLoading(false);
        } else {
            // Đăng nhập thành công, chuyển trang mượt mà
            router.push('/dashboard/projects');
        }
    };

    return (
        <div className="space-y-6 animate-slide-up">
            <div className="space-y-2 text-center lg:text-left">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t('auth.welcome_back')}</h1>
                <p className="text-slate-500">{t('auth.enter_credentials')}</p>
            </div>

            <form className="space-y-5" onSubmit={handleLogin}>
                {/* Thông báo lỗi nếu đăng nhập thất bại */}
                {error && (
                    <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200 delay-100 animate-slide-up">
                        {error}
                    </div>
                )}
                
                <div className="space-y-2 delay-100 animate-slide-up" style={{ animationFillMode: 'both' }}>
                    <Input 
                        label={t('auth.email')} 
                        type="email" 
                        placeholder="admin@work.os" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2 delay-200 animate-slide-up" style={{ animationFillMode: 'both' }}>
                    <Input 
                        label={t('auth.password')} 
                        type="password" 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="flex items-center justify-between text-sm delay-300 animate-slide-up" style={{ animationFillMode: 'both' }}>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4" />
                        <span className="text-slate-600">{t('auth.remember_me')}</span>
                    </label>
                    <Link href="#" className="text-blue-600 hover:text-blue-500 font-medium hover:underline">
                        {t('auth.forgot_password')}
                    </Link>
                </div>

                <div className="pt-2 delay-300 animate-slide-up" style={{ animationFillMode: 'both' }}>
                    <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full h-11 text-base shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-shadow disabled:opacity-50"
                    >
                        {loading ? 'Đang xác thực...' : t('auth.sign_in')}
                    </Button>
                </div>
            </form>

            <div className="text-center text-sm text-slate-500 delay-500 animate-slide-up" style={{ animationFillMode: 'both' }}>
                {t('auth.no_account')}{' '}
                <Link href="/register" className="text-blue-600 font-semibold hover:underline">
                    {t('auth.sign_up')}
                </Link>
            </div>
        </div>
    );
}
