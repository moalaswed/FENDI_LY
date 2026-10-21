"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ProductItem, CategoryOption } from "@/types/products";
import { createProductAction, updateProductAction } from "@/app/admin/product-actions";

interface ProductFormProps {
  initialProduct?: ProductItem;
  categories: CategoryOption[];
  galleryImages: string[];
  isEdit?: boolean;
}

export default function ProductForm({
  initialProduct,
  categories,
  galleryImages,
  isEdit = false,
}: ProductFormProps) {
  const router = useRouter();

  // Form State
  const [id, setId] = useState(initialProduct?.id || "");
  const [code, setCode] = useState(initialProduct?.code || "");
  const [name, setName] = useState(initialProduct?.name || "");
  const [categoryKey, setCategoryKey] = useState(
    initialProduct?.category || (categories[0]?.key !== "all" ? categories[0]?.key : "electrical") || ""
  );
  const [shortDesc, setShortDesc] = useState(initialProduct?.shortDesc || "");
  const [tag, setTag] = useState(initialProduct?.tag || "");
  const [sortOrder, setSortOrder] = useState<number>(initialProduct?.sortOrder ?? 0);
  const [isActive, setIsActive] = useState<boolean>(initialProduct?.isActive ?? true);

  // Features list
  const [features, setFeatures] = useState<string[]>(
    initialProduct?.features && initialProduct.features.length > 0
      ? initialProduct.features
      : [""]
  );

  // Image State
  const [imagePath, setImagePath] = useState(initialProduct?.image || (galleryImages[0] || ""));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(initialProduct?.image || null);
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  // Video State
  const [videoUrl, setVideoUrl] = useState(initialProduct?.video || "");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(initialProduct?.video || null);
  const [removeVideo, setRemoveVideo] = useState(false);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto-slug generator for Create mode
  const handleAutoSlug = () => {
    if (isEdit) return;
    const base = code ? code.toLowerCase() : name;
    const slug = base
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (slug) {
      setId(slug);
    }
  };

  // Image File selection
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("حجم الصورة كبير جداً (الحد الأقصى 5 ميجابايت).");
        return;
      }
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
      setErrorMessage(null);
    }
  };

  // Gallery Image selection
  const selectGalleryImage = (src: string) => {
    setImagePath(src);
    setImageFile(null);
    setImagePreviewUrl(src);
    setShowGalleryModal(false);
  };

  // Video File selection
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        setErrorMessage("حجم ملف الفيديو كبير جداً (الحد الأقصى 25 ميجابايت).");
        return;
      }
      setVideoFile(file);
      setRemoveVideo(false);
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);
      setErrorMessage(null);
    }
  };

  // Video URL change
  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setVideoUrl(val);
    setVideoFile(null);
    setRemoveVideo(false);
    setVideoPreviewUrl(val.trim() || null);
  };

  // Clear Video
  const handleClearVideo = () => {
    setVideoUrl("");
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setRemoveVideo(true);
  };

  // Features helpers
  const handleFeatureChange = (index: number, val: string) => {
    const updated = [...features];
    updated[index] = val;
    setFeatures(updated);
  };

  const addFeatureInput = () => {
    setFeatures([...features, ""]);
  };

  const removeFeatureInput = (index: number) => {
    if (features.length <= 1) {
      setFeatures([""]);
      return;
    }
    const updated = features.filter((_, i) => i !== index);
    setFeatures(updated);
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Filter non-empty features
    const cleanFeatures = features.map((f) => f.trim()).filter((f) => f.length > 0);
    if (cleanFeatures.length === 0) {
      setErrorMessage("يرجى إدخال ميزة فنية واحدة على الأقل للمنتج.");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("id", id.trim());
    formData.append("code", code.trim());
    formData.append("name", name.trim());
    formData.append("categoryKey", categoryKey.trim());
    formData.append("shortDesc", shortDesc.trim());
    formData.append("features", cleanFeatures.join("\n"));
    formData.append("tag", tag.trim());
    formData.append("sortOrder", String(sortOrder));
    formData.append("isActive", isActive ? "true" : "false");

    // Image
    if (imageFile) {
      formData.append("imageFile", imageFile);
    }
    formData.append("imagePath", imagePath.trim());

    // Video
    if (removeVideo) {
      formData.append("removeVideo", "true");
    } else {
      if (videoFile) {
        formData.append("videoFile", videoFile);
      }
      if (videoUrl.trim()) {
        formData.append("videoUrl", videoUrl.trim());
      }
    }

    if (isEdit && initialProduct?.updatedAt) {
      formData.append("expectedUpdatedAt", initialProduct.updatedAt);
    }

    try {
      const response = isEdit
        ? await updateProductAction(formData)
        : await createProductAction(formData);

      if (!response.success) {
        setErrorMessage(response.error || "حدث خطأ أثناء معالجة الطلب.");
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage(
        isEdit ? "تم تحديث بيانات المنتج بنجاح!" : "تم إنشاء وحفظ المنتج الجديد بنجاح!"
      );

      setTimeout(() => {
        router.push("/admin/products");
        router.refresh();
      }, 1000);
    } catch {
      setErrorMessage("حدث خطأ في الاتصال بالخادم. يرجى إعادة المحاولة.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="text-right">
      {/* Alert Messages */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-[#A50000] text-white flex items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A50000] animate-pulse" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-white/60 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-600 text-emerald-200 flex items-center gap-2 text-xs sm:text-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span>{successMessage} (جارٍ التحويل...)</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Identification & Taxonomy */}
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6 sm:p-8">
          <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#A50000]" />
            <span>البيانات الأساسية والتصنيف</span>
          </h3>
          <p className="text-xs text-[#8E8E8E] mb-6">
            حدد الرمز المميز والمعرف والتصنيف الصناعي للمنتج
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Product Code */}
            <div>
              <label className="block text-xs font-bold text-white mb-2">
                كود المنتج (رمز الصنف) <span className="text-[#A50000]">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onBlur={handleAutoSlug}
                placeholder="مثال: F0022"
                dir="ltr"
                className="w-full px-4 py-2.5 rounded-xl bg-[#202020] border border-[#2E2E2E] text-white font-mono text-sm focus:border-[#A50000] focus:outline-none transition-colors"
              />
              <span className="text-[10px] text-[#777777] mt-1 block">
                الرمز الفريد المستخدم في الفواتير واستفسارات WhatsApp
              </span>
            </div>

            {/* Product ID (Slug) */}
            <div>
              <label className="block text-xs font-bold text-white mb-2">
                معرف المنتج البرمجي (ID) <span className="text-[#A50000]">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isEdit}
                value={id}
                onChange={(e) => setId(e.target.value.toLowerCase())}
                placeholder="مثال: conduit-19mm-50m"
                dir="ltr"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono focus:outline-none transition-colors ${
                  isEdit
                    ? "bg-[#141414] border-[#222222] text-[#666666] cursor-not-allowed"
                    : "bg-[#202020] border-[#2E2E2E] text-white focus:border-[#A50000]"
                }`}
              />
              <span className="text-[10px] text-[#777777] mt-1 block">
                {isEdit ? "لا يمكن تعديل المعرف الأساسي" : "أحرف إنجليزية وأرقام وشُرط (-) فقط"}
              </span>
            </div>

            {/* Category Key */}
            <div>
              <label className="block text-xs font-bold text-white mb-2">
                القسم الصناعي <span className="text-[#A50000]">*</span>
              </label>
              <select
                required
                value={categoryKey}
                onChange={(e) => setCategoryKey(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#202020] border border-[#2E2E2E] text-white text-sm focus:border-[#A50000] focus:outline-none transition-colors cursor-pointer"
              >
                {categories
                  .filter((c) => c.key !== "all")
                  .map((cat) => (
                    <option key={cat.key} value={cat.key} className="bg-[#181818]">
                      {cat.label} ({cat.key})
                    </option>
                  ))}
              </select>
              <span className="text-[10px] text-[#777777] mt-1 block">
                ربط الصنف بالجدول المرجعي للأقسام في MariaDB
              </span>
            </div>

            {/* Product Name */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-bold text-white mb-2">
                اسم المنتج التجاري الكامل <span className="text-[#A50000]">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: مواسير كهربائية مرنة (قرجوطة الفاندي 19 مم)"
                className="w-full px-4 py-2.5 rounded-xl bg-[#202020] border border-[#2E2E2E] text-white text-sm focus:border-[#A50000] focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Media Assets (Image & Video) */}
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6 sm:p-8">
          <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#A50000]" />
            <span>وسائط العرض (الصورة والفيديو التوضيحي)</span>
          </h3>
          <p className="text-xs text-[#8E8E8E] mb-6">
            الصورة إلزامية كغلاف، والفيديو اختياري يُعرض بضغطة زر دون تشغيل تلقائي مزعج
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Management */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-white">
                صورة المنتج الرئيسية <span className="text-[#A50000]">*</span>
              </label>

              {/* Preview */}
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black border border-[#2E2E2E] flex items-center justify-center">
                {imagePreviewUrl ? (
                  <Image
                    src={imagePreviewUrl}
                    alt="معاينة صورة المنتج"
                    fill
                    sizes="400px"
                    className="object-contain"
                  />
                ) : (
                  <span className="text-xs text-[#666666]">لا توجد صورة محددة بعد</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Upload Local File */}
                <label className="px-4 py-2 rounded-xl bg-[#222222] hover:bg-[#2A2A2A] text-white text-xs font-semibold border border-[#333333] transition-colors cursor-pointer flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-[#A50000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>رفع صورة جديدة (JPG/PNG/WEBP)</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageFileChange}
                  />
                </label>

                {/* Pick From Existing Public Gallery */}
                <button
                  type="button"
                  onClick={() => setShowGalleryModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#202020] hover:bg-[#282828] text-[#C2C2C2] hover:text-white text-xs font-semibold border border-[#2E2E2E] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>اختيار من صور المصنع ({galleryImages.length})</span>
                </button>
              </div>

              {/* Current Path Input */}
              <div>
                <span className="text-[11px] text-[#777777] block mb-1">
                  أو أدخل مسار الصورة المباشر أو رابط HTTPS:
                </span>
                <input
                  type="text"
                  value={imagePath}
                  onChange={(e) => {
                    setImagePath(e.target.value);
                    setImageFile(null);
                    setImagePreviewUrl(e.target.value.trim() || null);
                  }}
                  dir="ltr"
                  placeholder="/photo_38_2026-10-20_20-13-24.jpg"
                  className="w-full px-3 py-2 rounded-lg bg-[#202020] border border-[#2E2E2E] text-white text-xs font-mono"
                />
              </div>
            </div>

            {/* Video Management (Optional) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-white">
                  فيديو توضيحي للمنتج <span className="text-[#8E8E8E] font-normal">(اختياري)</span>
                </label>
                {(videoUrl || videoFile || videoPreviewUrl) && (
                  <button
                    type="button"
                    onClick={handleClearVideo}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                  >
                    حذف الفيديو
                  </button>
                )}
              </div>

              {/* Preview */}
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black border border-[#2E2E2E] flex items-center justify-center">
                {videoPreviewUrl && !removeVideo ? (
                  <video
                    src={videoPreviewUrl}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-4">
                    <svg className="w-10 h-10 text-[#444444] mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-[#666666] block">لا يوجد فيديو توضيحي مرفق</span>
                    <span className="text-[10px] text-[#555555] block mt-0.5">سيظهر المنتج بصورته الثابتة فقط</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Upload Local Video */}
                <label className="px-4 py-2 rounded-xl bg-[#222222] hover:bg-[#2A2A2A] text-white text-xs font-semibold border border-[#333333] transition-colors cursor-pointer flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-[#A50000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>رفع فيديو MP4 / WebM (حتى 25MB)</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/ogg"
                    className="hidden"
                    onChange={handleVideoFileChange}
                  />
                </label>
              </div>

              {/* Video URL Input */}
              <div>
                <span className="text-[11px] text-[#777777] block mb-1">
                  أو أدخل رابط فيديو خارجي (YouTube أو Vimeo أو MP4):
                </span>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={handleVideoUrlChange}
                  dir="ltr"
                  placeholder="https://www.youtube.com/watch?v=... أو https://..."
                  className="w-full px-3 py-2 rounded-lg bg-[#202020] border border-[#2E2E2E] text-white text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Description, Technical Specs & Settings */}
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6 sm:p-8 space-y-6">
          <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#A50000]" />
            <span>المواصفات الفنية وإعدادات العرض</span>
          </h3>

          {/* Short Description */}
          <div>
            <label className="block text-xs font-bold text-white mb-2">
              الوصف المختصر <span className="text-[#A50000]">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              placeholder="وصف تسويقي وفني مختصر يوضح مواصفات المنتج واستخداماته..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#202020] border border-[#2E2E2E] text-white text-sm focus:border-[#A50000] focus:outline-none transition-colors"
            />
          </div>

          {/* Features Bullets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-white">
                الميزات والمواصفات الفنية (نقاط مميزة) <span className="text-[#A50000]">*</span>
              </label>
              <button
                type="button"
                onClick={addFeatureInput}
                className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>+</span>
                <span>إضافة ميزة أخرى</span>
              </button>
            </div>

            <div className="space-y-2">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#A50000] shrink-0" />
                  <input
                    type="text"
                    required={idx === 0}
                    value={feature}
                    onChange={(e) => handleFeatureChange(idx, e.target.value)}
                    placeholder={`ميزة ${idx + 1} (مثال: مقاوم لدرجات الحرارة العالية)`}
                    className="flex-1 px-4 py-2 rounded-xl bg-[#202020] border border-[#2E2E2E] text-white text-xs sm:text-sm focus:border-[#A50000] focus:outline-none transition-colors"
                  />
                  {features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeatureInput(idx)}
                      className="px-2.5 py-2 rounded-xl bg-[#222222] hover:bg-red-950 text-red-400 text-xs border border-[#333333] transition-colors"
                      title="حذف هذا السطر"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tag, Sort Order, Is Active Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-[#242424]">
            {/* Tag */}
            <div>
              <label className="block text-xs font-bold text-white mb-2">
                شارة مميزة / وسم (Tag) <span className="text-[#8E8E8E] font-normal">(اختياري)</span>
              </label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="مثال: الأكثر طلباً، جديد"
                className="w-full px-4 py-2.5 rounded-xl bg-[#202020] border border-[#2E2E2E] text-white text-xs sm:text-sm focus:border-[#A50000] focus:outline-none transition-colors"
              />
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-xs font-bold text-white mb-2">
                ترتيب الظهور (Sort Order)
              </label>
              <input
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#202020] border border-[#2E2E2E] text-white text-xs sm:text-sm focus:border-[#A50000] focus:outline-none transition-colors"
              />
              <span className="text-[10px] text-[#777777] mt-1 block">
                الأرقام الأصغر تظهر أولاً
              </span>
            </div>

            {/* Is Active Toggle */}
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-3 p-3 rounded-xl bg-[#202020] border border-[#2E2E2E] cursor-pointer hover:border-[#3E3E3E] transition-colors">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 accent-[#A50000] rounded cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-white block">تفعيل المنتج</span>
                  <span className="text-[10px] text-[#8E8E8E] block">
                    {isActive ? "يظهر في المتجر العام" : "مخفي كمسودة"}
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Form Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href="/admin/products"
            className="px-6 py-3 rounded-xl bg-[#222222] hover:bg-[#282828] text-[#C2C2C2] hover:text-white text-xs sm:text-sm font-semibold border border-[#333333] transition-colors"
          >
            إلغاء والعودة
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 rounded-xl bg-[#A50000] hover:bg-[#C20000] disabled:bg-[#520000] text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#A50000]/30 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>جارٍ الحفظ والمزامنة...</span>
              </>
            ) : (
              <span>{isEdit ? "حفظ التعديلات في قاعدة البيانات" : "إضافة المنتج إلى الكتالوج"}</span>
            )}
          </button>
        </div>
      </form>

      {/* Gallery Modal Picker */}
      {showGalleryModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowGalleryModal(false)}
        >
          <div
            className="bg-[#181818] border border-[#2E2E2E] rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl p-6 text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#252525] mb-4">
              <button
                type="button"
                onClick={() => setShowGalleryModal(false)}
                className="text-[#888888] hover:text-white text-sm"
              >
                ✕ إغلاق
              </button>
              <div>
                <h3 className="text-base font-bold text-white">معرض صور مصنع الفاندي</h3>
                <p className="text-xs text-[#8E8E8E]">اختر أي صورة مسجلة مسبقاً لاستخدامها كغلاف للصنف</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 p-1">
              {galleryImages.map((src) => (
                <button
                  type="button"
                  key={src}
                  onClick={() => selectGalleryImage(src)}
                  className={`group relative aspect-square rounded-xl overflow-hidden border transition-all cursor-pointer ${
                    imagePath === src
                      ? "border-[#A50000] ring-2 ring-[#A50000]"
                      : "border-[#2E2E2E] hover:border-white/40"
                  }`}
                >
                  <Image
                    src={src}
                    alt={src}
                    fill
                    sizes="120px"
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-black/75 p-1 text-[9px] text-[#C2C2C2] font-mono truncate text-center" dir="ltr">
                    {src.replace("/", "")}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
