import React from "react";
import Image from "next/image";
import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";
import { COMPANY } from "@/data/company";
import type { AdminUserDto } from "@/lib/admin/dal";

interface AdminHeaderProps {
  admin: AdminUserDto;
  activePath?: "/admin" | "/admin/products" | "/admin/products/new";
}

export default function AdminHeader({ admin, activePath = "/admin" }: AdminHeaderProps) {
  return (
    <header className="border-b border-[#242424] bg-[#161616]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Portal Title */}
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-[#520000] bg-black p-0.5 group-hover:border-[#A50000] transition-colors">
              <Image
                src="/logo.png"
                alt={COMPANY.brandName.fullAr}
                fill
                sizes="36px"
                className="object-contain"
              />
            </div>
            <div>
              <span className="font-bold text-white text-sm block group-hover:text-red-400 transition-colors">
                {COMPANY.brandName.fullAr}
              </span>
              <span className="text-[10px] text-[#8E8E8E] block">
                بوابة الإدارة المركزية
              </span>
            </div>
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1.5 mr-6 border-r border-[#2C2C2C] pr-6">
            <Link
              href="/admin"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activePath === "/admin"
                  ? "bg-[#A50000] text-white shadow-md shadow-[#A50000]/20"
                  : "text-[#B8B8B8] hover:text-white hover:bg-[#222222]"
              }`}
            >
              نظرة عامة
            </Link>

            <Link
              href="/admin/products"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activePath === "/admin/products"
                  ? "bg-[#A50000] text-white shadow-md shadow-[#A50000]/20"
                  : "text-[#B8B8B8] hover:text-white hover:bg-[#222222]"
              }`}
            >
              إدارة المنتجات
            </Link>

            <Link
              href="/admin/products/new"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                activePath === "/admin/products/new"
                  ? "bg-[#A50000] text-white shadow-md shadow-[#A50000]/20"
                  : "text-[#B8B8B8] hover:text-white hover:bg-[#222222]"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>إضافة منتج</span>
            </Link>
          </nav>
        </div>

        {/* User Status & External Link & Logout */}
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#202020] hover:bg-[#282828] text-[#C2C2C2] hover:text-white text-xs font-medium border border-[#333333] transition-colors"
            title="فتح صفحة الكتالوج العامة في تبويب جديد"
          >
            <span>عرض المتجر</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </Link>

          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-white" dir="ltr">
              {admin.username}
            </span>
            <span className="text-[10px] text-[#A50000] font-semibold">
              مشرف أعلى (Super Admin)
            </span>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-[#222222] hover:bg-[#A50000] text-white text-xs font-medium border border-[#333333] hover:border-[#A50000] transition-colors cursor-pointer flex items-center gap-1.5"
              title="تسجيل الخروج وإنهاء الجلسة الآمنة"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                />
              </svg>
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-[#222222] bg-[#141414] px-2 py-2">
        <Link
          href="/admin"
          className={`px-3 py-1 rounded-md text-xs font-bold ${
            activePath === "/admin" ? "bg-[#A50000] text-white" : "text-[#888888]"
          }`}
        >
          نظرة عامة
        </Link>
        <Link
          href="/admin/products"
          className={`px-3 py-1 rounded-md text-xs font-bold ${
            activePath === "/admin/products" ? "bg-[#A50000] text-white" : "text-[#888888]"
          }`}
        >
          إدارة المنتجات
        </Link>
        <Link
          href="/admin/products/new"
          className={`px-3 py-1 rounded-md text-xs font-bold ${
            activePath === "/admin/products/new" ? "bg-[#A50000] text-white" : "text-[#888888]"
          }`}
        >
          إضافة منتج
        </Link>
        <Link
          href="/products"
          target="_blank"
          className="px-2 py-1 text-xs text-[#888888]"
        >
          المتجر
        </Link>
      </div>
    </header>
  );
}
