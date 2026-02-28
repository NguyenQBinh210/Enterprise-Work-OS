'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function LanguageSwitcher() {
    const { locale, setLocale } = useLanguage();

    return (
        <div className="flex bg-slate-100 rounded-lg p-1">
            <button
                onClick={() => setLocale('en')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${locale === 'en'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
            >
                EN
            </button>
            <button
                onClick={() => setLocale('vi')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${locale === 'vi'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
            >
                VI
            </button>
        </div>
    );
}
