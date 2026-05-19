'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
    const router = useRouter();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const supabase = createClient();
        const fullName = `${firstName} ${lastName}`.trim();

        // 1. Tạo tài khoản trong LÕI BẢO MẬT (auth.users) của Supabase
        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName }
            }
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
            return;
        }

        // 2. TẠO HỒ SƠ PUBLIC (Đồng bộ vào bảng "Users" của chúng ta)
        // Tạo một ID ngẫu nhiên gồm 8 ký tự kiểu: usr_a1b2
        const randomChars = Math.random().toString(36).substring(2, 6);
        const shortId = `usr_${randomChars}`;
        
        const { error: insertError } = await supabase.from('Users').insert({
            Id: shortId,
            Email: email,
            FullName: fullName,
            SystemRole: 'USER'
        });

        if (insertError) {
            console.error("Lỗi khi đồng bộ Hồ sơ:", insertError);
            setError("Lỗi đồng bộ hồ sơ. Bạn hãy kiểm tra xem đã TẮT tính năng 'Confirm Email' trên Supabase chưa nhé.");
            setLoading(false);
            return;
        }

        // Thành công!
        setSuccess(true);
        setLoading(false);
        
        // Chờ 1.5 giây rồi tự nhảy vào trang bên trong
        setTimeout(() => {
            router.push('/dashboard/projects');
        }, 1500);
    };

    return (
        <div className="space-y-6 animate-slide-up">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-slate-900">Tạo tài khoản mới</h1>
                <p className="text-slate-500 text-sm mt-2">Bắt đầu trải nghiệm Enterprise Work-OS</p>
            </div>

            <form className="space-y-4" onSubmit={handleRegister}>
                {error && (
                    <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200 delay-100 animate-slide-up">
                        {error}
                    </div>
                )}
                
                {success && (
                    <div className="p-3 text-sm text-green-700 bg-green-50 rounded-md border border-green-200 delay-100 animate-slide-up">
                        Đăng ký thành công! Đang chuyển hướng...
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Họ"
                        placeholder="Nguyễn"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        disabled={loading || success}
                    />
                    <Input
                        label="Tên"
                        placeholder="Văn A"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        disabled={loading || success}
                    />
                </div>
                <Input
                    label="Email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading || success}
                />
                <Input
                    label="Mật khẩu"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading || success}
                    minLength={6}
                />

                <div className="text-sm text-slate-500">
                    Bằng việc tạo tài khoản, bạn đồng ý với{' '}
                    <Link href="#" className="text-blue-600 hover:text-blue-500">
                        Điều khoản dịch vụ
                    </Link>
                    {' '}và{' '}
                    <Link href="#" className="text-blue-600 hover:text-blue-500">
                        Chính sách bảo mật
                    </Link>.
                </div>

                <div className="pt-2">
                    <Button 
                        type="submit" 
                        className="w-full h-11 text-base shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-shadow disabled:opacity-50" 
                        disabled={loading || success}
                    >
                        {loading ? 'Đang xử lý...' : 'Đăng ký ngay'}
                    </Button>
                </div>
            </form>

            <div className="text-center text-sm text-slate-500">
                Đã có tài khoản?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                    Đăng nhập tại đây
                </Link>
            </div>
        </div>
    );
}
