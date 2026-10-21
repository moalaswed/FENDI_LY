import type { Metadata } from "next";
import Image from "next/image";
import { requirePasswordChangePending } from "@/lib/admin/dal";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";
import { COMPANY } from "@/data/company";

export const instant = false;

export const metadata: Metadata = {
  title: `تحديث كلمة المرور الإلزامية | ${COMPANY.brandName.fullAr}`,
  description: "تغيير كلمة المرور المؤقتة للبدء في استخدام لوحة التحكم",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ChangePasswordPage() {
  // Guard: requires authenticated admin whose mustChangePassword flag is true
  const admin = await requirePasswordChangePending();

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
            تأمين وتفعيل حساب المشرف الجديد
          </p>
        </div>

        {/* Change Password Card */}
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="mb-6 pb-4 border-b border-[#242424] text-right">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#A50000]/20 border border-[#A50000]/40 text-[#A50000] text-xs font-bold mb-2">
              <span className="w-2 h-2 rounded-full bg-[#A50000] animate-pulse" />
              <span>إجراء أمني إلزامي</span>
            </div>
            <h2 className="text-lg font-bold text-white">
              تعيين كلمة مرور دائمة
            </h2>
            <p className="text-xs text-[#8E8E8E] mt-0.5">
              مرحباً بك <span className="text-white font-bold">{admin.username}</span>. لأسباب أمنية، يجب تغيير كلمة المرور المؤقتة فوراً لتتمكن من الوصول للوحة التحكم.
            </p>
          </div>

          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
