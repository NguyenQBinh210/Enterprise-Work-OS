'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function LoginPage() {
    const { t } = useLanguage();

    return (
        <div className="space-y-6 animate-slide-up">
            <div className="space-y-2 text-center lg:text-left">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t('auth.welcome_back')}</h1>
                <p className="text-slate-500">{t('auth.enter_credentials')}</p>
            </div>

            <form className="space-y-5">
                <div className="space-y-2 delay-100 animate-slide-up" style={{ animationFillMode: 'both' }}>
                    <Input label={t('auth.email')} type="email" placeholder="john@example.com" />
                </div>
                <div className="space-y-2 delay-200 animate-slide-up" style={{ animationFillMode: 'both' }}>
                    <Input label={t('auth.password')} type="password" placeholder="••••••••" />
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
                    <Link href="/dashboard" className="block w-full">
                        <Button className="w-full h-11 text-base shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-shadow">
                            {t('auth.sign_in')}
                        </Button>
                    </Link>
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
