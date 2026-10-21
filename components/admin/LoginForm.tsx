"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { loginAction, ActionResponse } from "@/app/admin/actions";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState<ActionResponse | null, FormData>(
    loginAction,
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
          htmlFor="username"
          className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider mb-2"
        >
          اسم المستخدم
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          autoComplete="username"
          placeholder="أدخل اسم المستخدم"
          className="w-full py-3 px-4 rounded-xl bg-[#202020] border border-[#2E2E2E] text-white text-sm placeholder-[#777777] focus:outline-none focus:border-[#A50000] focus:ring-1 focus:ring-[#A50000] transition-colors"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider mb-2"
        >
          كلمة المرور
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••••••"
          className="w-full py-3 px-4 rounded-xl bg-[#202020] border border-[#2E2E2E] text-white text-sm placeholder-[#777777] focus:outline-none focus:border-[#A50000] focus:ring-1 focus:ring-[#A50000] transition-colors"
        />
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
            <span>جاري التحقق...</span>
          </>
        ) : (
          <span>تسجيل الدخول</span>
        )}
      </button>

      <div className="pt-2 text-center">
        <Link
          href="/"
          className="text-xs text-[#8E8E8E] hover:text-white transition-colors"
        >
          ← العودة إلى الموقع الرئيسي
        </Link>
      </div>
    </form>
  );
}
