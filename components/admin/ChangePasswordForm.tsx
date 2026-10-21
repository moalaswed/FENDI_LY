"use client";

import React, { useActionState } from "react";
import { changePasswordAction, ActionResponse } from "@/app/admin/actions";

export default function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState<ActionResponse | null, FormData>(
    changePasswordAction,
    null
  );

  return (
    <form action={formAction} className="space-y-5 text-right">
      {state?.error && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-red-950/40 border border-[#A50000]/60 text-xs text-[#E0E0E0] flex items-start gap-2.5 shadow-lg"
        >
          <span className="w-2 h-2 rounded-full bg-[#A50000] shrink-0 mt-1 animate-pulse" />
          <span>{state.error}</span>
        </div>
      )}

      <div>
        <label
          htmlFor="currentPassword"
          className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider mb-2"
        >
          كلمة المرور المؤقتة الحالية
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          placeholder="أدخل كلمة المرور التي سجلت الدخول بها"
          className="w-full py-3 px-4 rounded-xl bg-[#202020] border border-[#2E2E2E] text-white text-sm placeholder-[#777777] focus:outline-none focus:border-[#A50000] focus:ring-1 focus:ring-[#A50000] transition-colors"
        />
      </div>

      <div>
        <label
          htmlFor="newPassword"
          className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider mb-2"
        >
          كلمة المرور الجديدة الدائمة
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          autoComplete="new-password"
          placeholder="10 خانات على الأقل (حروف وأرقام)"
          className="w-full py-3 px-4 rounded-xl bg-[#202020] border border-[#2E2E2E] text-white text-sm placeholder-[#777777] focus:outline-none focus:border-[#A50000] focus:ring-1 focus:ring-[#A50000] transition-colors"
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider mb-2"
        >
          تأكيد كلمة المرور الجديدة
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          placeholder="أعد إدخال كلمة المرور الجديدة"
          className="w-full py-3 px-4 rounded-xl bg-[#202020] border border-[#2E2E2E] text-white text-sm placeholder-[#777777] focus:outline-none focus:border-[#A50000] focus:ring-1 focus:ring-[#A50000] transition-colors"
        />
      </div>

      <div className="p-3.5 rounded-xl bg-[#202020] border border-[#2A2A2A] text-xs text-[#999999] space-y-1">
        <p className="font-bold text-white mb-1">متطلبات الأمان الإلزامية:</p>
        <p>• طول كلمة المرور لا يقل عن 10 خانات.</p>
        <p>• تحتوي على مزيج من الأحرف والأرقام.</p>
        <p>• تختلف عن كلمة المرور المؤقتة التي تم تزويدك بها.</p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3.5 px-6 rounded-xl bg-[#A50000] hover:bg-[#C20000] disabled:bg-[#5A0000] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-lg shadow-[#A50000]/30 hover:shadow-[#A50000]/50 hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            <span>جاري تحديث وتدوير الجلسة...</span>
          </>
        ) : (
          <span>حفظ كلمة المرور وتفعيل الحساب</span>
        )}
      </button>
    </form>
  );
}
