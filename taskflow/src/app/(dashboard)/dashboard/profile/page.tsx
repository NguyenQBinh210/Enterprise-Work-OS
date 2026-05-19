'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { Camera, Trash2, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { uploadImage, deleteImage } from '@/actions/media.actions';

export default function ProfilePage() {
    const { t } = useLanguage();
    const supabase = createClient();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Core User fields
    const [fullName, setFullName] = useState('');

    // UserProfiles fields
    const [avatarUrl, setAvatarUrl] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [gender, setGender] = useState('');
    const [address, setAddress] = useState('');
    const [bio, setBio] = useState('');
    const [department, setDepartment] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            const { data: userData } = await supabase
                .from('Users')
                .select('*')
                .eq('Email', session.user.email)
                .single();

            if (userData) {
                setUser(userData);
                setFullName(userData.FullName || '');

                const { data: profileData } = await supabase
                    .from('UserProfiles')
                    .select('*')
                    .eq('UserId', userData.Id)
                    .single();

                if (profileData) {
                    setAvatarUrl(profileData.AvatarUrl || '');
                    setPhoneNumber(profileData.PhoneNumber || '');
                    setDateOfBirth(profileData.DateOfBirth || '');
                    setGender(profileData.Gender || '');
                    setAddress(profileData.Address || '');
                    setBio(profileData.Bio || '');
                    setDepartment(profileData.Department || '');
                }
            }
        }
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // 1. Update Users table
            const { error: userError } = await supabase
                .from('Users')
                .update({ FullName: fullName })
                .eq('Id', user.Id);

            if (userError) throw userError;

            // 2. Update or Insert UserProfiles table
            const profilePayload = {
                UserId: user.Id,
                AvatarUrl: avatarUrl,
                PhoneNumber: phoneNumber,
                DateOfBirth: dateOfBirth || null,
                Gender: gender,
                Address: address,
                Bio: bio,
                Department: department,
                UpdatedAt: new Date().toISOString()
            };

            const { data: existingProfile } = await supabase
                .from('UserProfiles')
                .select('UserId')
                .eq('UserId', user.Id)
                .single();

            if (existingProfile) {
                const { error: profileError } = await supabase
                    .from('UserProfiles')
                    .update(profilePayload)
                    .eq('UserId', user.Id);
                if (profileError) throw profileError;
            } else {
                const { error: profileError } = await supabase
                    .from('UserProfiles')
                    .insert(profilePayload);
                if (profileError) throw profileError;
            }

            toast.success('Cập nhật hồ sơ thành công!');
        } catch (error: any) {
            toast.error('Lỗi khi cập nhật: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    // LOGIC MỚI: TẢI ẢNH LÊN CLOUDINARY QUA SERVER ACTION (BẢO MẬT)
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        // Kiểm tra dung lượng (giới hạn 1MB)
        if (file.size > 1 * 1024 * 1024) {
            toast.error("Ảnh quá nặng! Vui lòng chọn ảnh dưới 1MB.");
            return;
        }

        setUploading(true);
        try {
            // Đọc file thành base64 để gửi lên Server Action
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async () => {
                const base64data = reader.result as string;
                
                try {
                    const result = await uploadImage(base64data, 'avatars');

                    if (result?.url) {
                        // 1. Cập nhật giao diện ngay
                        setAvatarUrl(result.url);
                        
                        // 2. TỰ ĐỘNG LƯU VÀO DATABASE LUÔN (Rất tiện lợi)
                        const { error } = await supabase
                            .from('UserProfiles')
                            .update({ AvatarUrl: result.url, UpdatedAt: new Date().toISOString() })
                            .eq('UserId', user.Id);
                        
                        if (error) throw error;

                        toast.success("Đã cập nhật ảnh đại diện!");
                    }
                } catch (err: any) {
                    toast.error("Lỗi lưu ảnh: " + err.message);
                } finally {
                    setUploading(false);
                }
            };
        } catch (error: any) {
            console.error(error);
            toast.error("Lỗi khi tải ảnh: " + error.message);
            setUploading(false);
        }
    };

    // LOGIC XÓA ẢNH ĐẠI DIỆN (BẢO MẬT & ĐỒNG BỘ)
    const handleRemoveAvatar = async () => {
        if (!avatarUrl) return;
        
        if (window.confirm("Bạn có chắc chắn muốn xóa ảnh đại diện này?")) {
            setUploading(true);
            try {
                // 1. Xóa trên Cloudinary qua Server Action
                await deleteImage(avatarUrl);

                // 2. Cập nhật Database
                const { error } = await supabase
                    .from('UserProfiles')
                    .update({ AvatarUrl: '', UpdatedAt: new Date().toISOString() })
                    .eq('UserId', user.Id);
                
                if (error) throw error;

                // 3. Cập nhật giao diện
                setAvatarUrl('');
                toast.success("Đã xóa ảnh đại diện");
            } catch (err: any) {
                toast.error("Lỗi khi xóa ảnh: " + err.message);
            } finally {
                setUploading(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="ml-3 text-slate-500 font-medium">Đang tải hồ sơ...</span>
            </div>
        );
    }

    if (!user) {
        return <div className="p-8 text-center text-red-500">Không tìm thấy thông tin người dùng.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('profile.title')}</h1>
                <p className="text-slate-500 mt-2">{t('profile.subtitle')}</p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <form onSubmit={handleSave} className="p-8 md:p-12 space-y-10">

                    {/* Avatar Section */}
                    <div className="flex flex-col md:flex-row items-center gap-8 bg-slate-50 p-8 rounded-2xl border border-slate-100">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-2xl overflow-hidden shrink-0 transition-transform group-hover:scale-105 duration-300">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
                                        <span className="text-4xl font-black text-white">{fullName.charAt(0).toUpperCase()}</span>
                                    </div>
                                )}
                                {uploading && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl hover:bg-blue-700 transition-all hover:scale-110 active:scale-95"
                            >
                                <Camera className="w-5 h-5" />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h3 className="text-xl font-bold text-slate-900">{t('profile.avatar_title')}</h3>
                            <p className="text-sm text-slate-500 mt-2 max-w-xs leading-relaxed">
                                {t('profile.avatar_desc')}
                            </p>
                            <div className="flex gap-3 mt-4 justify-center md:justify-start">
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm font-bold text-blue-600 hover:text-blue-700">{t('profile.change_image')}</button>
                                <span className="text-slate-300">|</span>
                                <button type="button" onClick={handleRemoveAvatar} className="text-sm font-bold text-red-500 hover:text-red-600">{t('profile.delete_image')}</button>
                            </div>
                        </div>
                    </div>

                    {/* Info Fields */}
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="col-span-1 md:col-span-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">{t('profile.full_name')}</label>
                                <input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none text-slate-900 font-bold transition-all" />
                            </div>

                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">{t('profile.phone')}</label>
                                <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="09xx..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none text-slate-900 transition-all" />
                            </div>

                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">{t('profile.dob')}</label>
                                <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none text-slate-900 transition-all" />
                            </div>

                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">{t('profile.gender')}</label>
                                <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none text-slate-900 transition-all font-medium">
                                    <option value="">{t('profile.gender_unspecified')}</option>
                                    <option value="Nam">{t('profile.gender_male')}</option>
                                    <option value="Nữ">{t('profile.gender_female')}</option>
                                    <option value="Khác">{t('profile.gender_other')}</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">{t('profile.department')}</label>
                                <input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder={t('profile.department_placeholder') as string} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none text-slate-900 transition-all" />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">{t('profile.address')}</label>
                                <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t('profile.address_placeholder') as string} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none text-slate-900 transition-all" />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">{t('profile.bio')}</label>
                                <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder={t('profile.bio_placeholder') as string} rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none text-slate-900 transition-all resize-none leading-relaxed" />
                            </div>

                            <div className="opacity-60 bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">{t('profile.fixed_email')}</label>
                                <p className="text-sm font-bold text-slate-700">{user.Email}</p>
                            </div>
                            <div className="opacity-60 bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">{t('profile.system_role')}</label>
                                <p className="text-sm font-bold text-slate-700">{user.SystemRole}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-slate-100">
                        <Button type="submit" disabled={saving} className="px-10 py-6 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20 rounded-2xl">
                            {saving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    {t('profile.saving')}
                                </>
                            ) : t('profile.save_changes')}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50/50 rounded-3xl border-2 border-dashed border-red-100 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h2 className="text-xl font-black text-red-900 flex items-center gap-2">
                        <Trash2 className="w-5 h-5" />
                        {t('profile.danger_zone')}
                    </h2>
                    <p className="text-red-700/70 mt-1 text-sm font-medium">{t('profile.danger_desc')}</p>
                </div>
                <button
                    type="button"
                    onClick={async () => {
                        if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản vĩnh viễn?')) {
                            await supabase.from('Users').delete().eq('Id', user.Id);
                            await supabase.auth.signOut();
                            window.location.href = '/register';
                        }
                    }}
                    className="px-6 py-3 bg-red-600 text-white font-black rounded-xl shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all active:scale-95 text-sm uppercase tracking-wider"
                >
                    {t('profile.delete_account')}
                </button>
            </div>
        </div>
    );
}
