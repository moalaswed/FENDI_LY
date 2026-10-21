import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin/dal";
import LoginForm from "@/components/admin/LoginForm";
import { COMPANY } from "@/data/company";

export const instant = false;

export const metadata: Metadata = {
  title: `تسجيل دخول الإدارة | ${COMPANY.brandName.fullAr}`,
  description: "بوابة تسجيل الدخول الآمنة للوحة التحكم - شركة الفاندي للصناعات البلاستيكية",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage() {
  // If administrator is already authenticated, redirect appropriately
  const currentAdmin = await getCurrentAdmin();
  if (currentAdmin) {
    if (currentAdmin.mustChangePassword) {
      redirect("/admin/change-password");
    } else {
      redirect("/admin");
    }
  }

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col justify-center items-center px-4 sm:px-6 py-12 text-[#B8B8B8] selection:bg-[#A50000] selection:text-white relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(165,0,0,0.08)_0%,transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-block relative w-16 h-16 rounded-2xl overflow-hidden border border-[#520000] bg-black p-1 mb-4 shadow-xl shadow-[#A50000]/10">
            <Image
              src="/logo.png"
              alt={COMPANY.brandName.fullAr}
              fill
              sizes="64px"
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide">
            {COMPANY.brandName.fullAr}
          </h1>
          <p className="text-xs text-[#8E8E8E] mt-1 font-medium">
            بوابة الإدارة المركزية وحماية النظام
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="mb-6 pb-4 border-b border-[#242424] text-right">
            <h2 className="text-lg font-bold text-white">تسجيل الدخول</h2>
            <p className="text-xs text-[#8E8E8E] mt-0.5">
              أدخل بيانات حساب المشرف للمتابعة إلى لوحة التحكم
            </p>
          </div>

          <LoginForm />
        </div>

        {/* Security Notice */}
        <p className="text-center text-[11px] text-[#666666] mt-6">
          هذه الصفحة مخصصة فقط للمشرفين المخولين. تخضع كافة محاولات الدخول للمراقبة الأمنية.
        </p>
      </div>
    </div>
  );
}
