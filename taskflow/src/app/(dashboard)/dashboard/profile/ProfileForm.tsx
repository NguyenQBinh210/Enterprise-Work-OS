"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppImage } from "@/components/ui/AppImage";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  deleteProfileAccount,
  getErrorMessage,
  loadProfile,
  removeProfileAvatar,
  saveProfile,
  uploadProfileAvatar,
  type ProfileUser,
  type ProfileValues,
} from "./profile.supabase";

const emptyProfileValues: ProfileValues = {
  fullName: "",
  avatarUrl: "",
  phoneNumber: "",
  dateOfBirth: "",
  gender: "",
  address: "",
  bio: "",
  department: "",
};

function formatDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  if (digits.length <= 2) return day;
  if (digits.length <= 4) return `${day}/${month}`;
  return `${day}/${month}/${year}`;
}

export function ProfileForm() {
  const { t } = useLanguage();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [values, setValues] = useState<ProfileValues>(emptyProfileValues);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let ignore = false;

    loadProfile()
      .then(({ user: loadedUser, values: loadedValues }) => {
        if (ignore) return;
        setUser(loadedUser);
        setValues(loadedValues);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const updateValue = (field: keyof ProfileValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      await saveProfile(user.Id, values);
      toast.success("Cập nhật hồ sơ thành công!");
    } catch (error) {
      toast.error("Lỗi khi cập nhật: " + getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const avatarUrl = await uploadProfileAvatar(file, user.Id);
      updateValue("avatarUrl", avatarUrl);
      toast.success("Đã cập nhật ảnh đại diện!");
    } catch (error) {
      toast.error("Lỗi khi tải ảnh: " + getErrorMessage(error));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    if (!values.avatarUrl || !user) return;

    if (window.confirm("Bạn có chắc chắn muốn xóa ảnh đại diện này?")) {
      setUploading(true);
      try {
        await removeProfileAvatar(values.avatarUrl, user.Id);
        updateValue("avatarUrl", "");
        toast.success("Đã xóa ảnh đại diện");
      } catch (error) {
        toast.error("Lỗi khi xóa ảnh: " + getErrorMessage(error));
      } finally {
        setUploading(false);
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    if (window.confirm("Bạn có chắc chắn muốn xóa tài khoản vĩnh viễn?")) {
      try {
        await deleteProfileAccount(user.Id);
        window.location.href = "/register";
      } catch (error) {
        toast.error("Lỗi khi xóa tài khoản: " + getErrorMessage(error));
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
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t("profile.title")}</h1>
        <p className="text-slate-500 mt-2">{t("profile.subtitle")}</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <form onSubmit={handleSave} className="p-8 md:p-12 space-y-10">
          <div className="flex flex-col md:flex-row items-center gap-8 bg-slate-50 p-8 rounded-2xl border border-slate-100">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-2xl overflow-hidden shrink-0 transition-transform group-hover:scale-105 duration-300">
                {values.avatarUrl ? (
                  <AppImage src={values.avatarUrl} alt="Avatar" fill className="w-full h-full" imageClassName="object-cover" sizes="128px" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
                    <span className="text-4xl font-black text-white">{values.fullName.charAt(0).toUpperCase()}</span>
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
              <h3 className="text-xl font-bold text-slate-900">{t("profile.avatar_title")}</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-xs leading-relaxed">
                {t("profile.avatar_desc")}
              </p>
              <div className="flex gap-3 mt-4 justify-center md:justify-start">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm font-bold text-blue-600 hover:text-blue-700">{t("profile.change_image")}</button>
                <span className="text-slate-300">|</span>
                <button type="button" onClick={handleRemoveAvatar} className="text-sm font-bold text-red-500 hover:text-red-600">{t("profile.delete_image")}</button>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="col-span-1 md:col-span-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">{t("profile.full_name")}</label>
                <input value={values.fullName} onChange={(e) => updateValue("fullName", e.target.value)} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none text-slate-900 font-bold transition-all" />
              </div>

              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">{t("profile.phone")}</label>
                <input value={values.phoneNumber} onChange={(e) => updateValue("phoneNumber", e.target.value)} placeholder="09xx..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none text-slate-900 transition-all" />
              </div>

              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">{t("profile.dob")}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={values.dateOfBirth}
                  onChange={(e) => updateValue("dateOfBirth", formatDateInput(e.target.value))}
                  placeholder="ngày/tháng/năm"
                  maxLength={10}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none text-slate-900 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">{t("profile.gender")}</label>
                <select value={values.gender} onChange={(e) => updateValue("gender", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none text-slate-900 transition-all font-medium">
                  <option value="">{t("profile.gender_unspecified")}</option>
                  <option value="Nam">{t("profile.gender_male")}</option>
                  <option value="Nữ">{t("profile.gender_female")}</option>
                  <option value="Khác">{t("profile.gender_other")}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">{t("profile.department")}</label>
                <input value={values.department} onChange={(e) => updateValue("department", e.target.value)} placeholder={t("profile.department_placeholder")} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none text-slate-900 transition-all" />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">{t("profile.address")}</label>
                <input value={values.address} onChange={(e) => updateValue("address", e.target.value)} placeholder={t("profile.address_placeholder")} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none text-slate-900 transition-all" />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">{t("profile.bio")}</label>
                <textarea value={values.bio} onChange={(e) => updateValue("bio", e.target.value)} placeholder={t("profile.bio_placeholder")} rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none text-slate-900 transition-all resize-none leading-relaxed" />
              </div>

              <div className="opacity-60 bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">{t("profile.fixed_email")}</label>
                <p className="text-sm font-bold text-slate-700">{user.Email}</p>
              </div>
              <div className="opacity-60 bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">{t("profile.system_role")}</label>
                <p className="text-sm font-bold text-slate-700">{user.SystemRole}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-slate-100">
            <Button type="submit" disabled={saving} className="px-10 py-6 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20 rounded-2xl">
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  {t("profile.saving")}
                </>
              ) : t("profile.save_changes")}
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-red-50/50 rounded-3xl border-2 border-dashed border-red-100 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-black text-red-900 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            {t("profile.danger_zone")}
          </h2>
          <p className="text-red-700/70 mt-1 text-sm font-medium">{t("profile.danger_desc")}</p>
        </div>
        <button
          type="button"
          onClick={handleDeleteAccount}
          className="px-6 py-3 bg-red-600 text-white font-black rounded-xl shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all active:scale-95 text-sm uppercase tracking-wider"
        >
          {t("profile.delete_account")}
        </button>
      </div>
    </div>
  );
}
