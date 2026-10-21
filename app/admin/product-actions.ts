"use server";

import { revalidateTag, updateTag, revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/admin/dal";
import {
  createAdminProduct,
  updateAdminProduct,
  toggleProductActiveState,
  deleteAdminProduct,
  handleSafeMediaUpload,
  removeUploadedMedia,
  type ProductInputData,
} from "@/lib/admin/products";

export interface ActionResponse {
  success: boolean;
  error?: string;
  productId?: string;
}

/**
 * Revalidates catalog cache across both the public store and admin portal.
 */
function revalidateCatalog(): void {
  try {
    updateTag("products");
    revalidateTag("products", "default");
    revalidatePath("/products");
    revalidatePath("/admin");
    revalidatePath("/admin/products");
  } catch (err) {
    console.warn("[REVALIDATE WARNING]", (err as Error).message);
  }
}

/**
 * Server Action: Create New Product
 * Enforces super_admin authorization, handles safe media uploads or validated paths,
 * validates all fields on the server, and atomically writes to PostgreSQL.
 */
export async function createProductAction(formData: FormData): Promise<ActionResponse> {
  // Authorization check inside Server Action
  await requireSuperAdmin();

  const uploadedMedia: string[] = [];
  try {
    const id = (formData.get("id") as string)?.trim();
    const code = (formData.get("code") as string)?.trim().toUpperCase();
    const name = (formData.get("name") as string)?.trim();
    const categoryKey = (formData.get("categoryKey") as string)?.trim();
    const shortDesc = (formData.get("shortDesc") as string)?.trim();
    const tag = (formData.get("tag") as string)?.trim() || null;
    const sortOrder = parseInt((formData.get("sortOrder") as string) || "0", 10);
    const isActive = formData.get("isActive") === "true" || formData.get("isActive") === "on";

    // Parse features (newline-separated or JSON string)
    const rawFeatures = formData.get("features") as string;
    let features: string[] = [];
    if (rawFeatures) {
      features = rawFeatures
        .split("\n")
        .map((f) => f.trim())
        .filter((f) => f.length > 0);
    }

    // 1. Image handling (uploaded file takes precedence over path string)
    let imagePath = (formData.get("imagePath") as string)?.trim() || "";
    const imageFile = formData.get("imageFile") as File | null;

    if (imageFile && imageFile.size > 0 && imageFile.name) {
      const uploadResult = await handleSafeMediaUpload(imageFile, "image");
      if (!uploadResult.success) {
        return { success: false, error: uploadResult.error };
      }
      imagePath = uploadResult.url!;
      uploadedMedia.push(imagePath);
    }

    if (!imagePath) {
      return { success: false, error: "صورة المنتج مطلوبة. يرجى رفع صورة أو اختيارها من المعرض." };
    }

    // 2. Video handling (optional: uploaded file takes precedence, else validated URL/path)
    let videoPath: string | null = (formData.get("videoUrl") as string)?.trim() || null;
    const videoFile = formData.get("videoFile") as File | null;

    if (videoFile && videoFile.size > 0 && videoFile.name) {
      const uploadResult = await handleSafeMediaUpload(videoFile, "video");
      if (!uploadResult.success) {
        uploadedMedia.forEach(removeUploadedMedia);
        return { success: false, error: uploadResult.error };
      }
      videoPath = uploadResult.url!;
      uploadedMedia.push(videoPath);
    }

    const inputData: ProductInputData = {
      id,
      code,
      name,
      categoryKey,
      image: imagePath,
      video: videoPath,
      shortDesc,
      features,
      tag,
      sortOrder: isNaN(sortOrder) ? 0 : sortOrder,
      isActive,
    };

    const result = await createAdminProduct(inputData);
    if (!result.success) {
      uploadedMedia.forEach(removeUploadedMedia);
      return { success: false, error: result.error };
    }

    // Invalidate product catalog cache
    revalidateCatalog();

    return { success: true, productId: result.productId };
  } catch (err) {
    uploadedMedia.forEach(removeUploadedMedia);
    console.error("[CREATE ACTION ERROR]", (err as Error).message);
    return { success: false, error: "تعذر إنشاء المنتج بسبب خطأ غير متوقع." };
  }
}

/**
 * Server Action: Update Existing Product
 * Enforces super_admin authorization, concurrency check, server validation,
 * safe media replacement, and cache revalidation.
 */
export async function updateProductAction(formData: FormData): Promise<ActionResponse> {
  // Authorization check inside Server Action
  await requireSuperAdmin();

  const uploadedMedia: string[] = [];
  try {
    const id = (formData.get("id") as string)?.trim();
    const code = (formData.get("code") as string)?.trim().toUpperCase();
    const name = (formData.get("name") as string)?.trim();
    const categoryKey = (formData.get("categoryKey") as string)?.trim();
    const shortDesc = (formData.get("shortDesc") as string)?.trim();
    const tag = (formData.get("tag") as string)?.trim() || null;
    const sortOrder = parseInt((formData.get("sortOrder") as string) || "0", 10);
    const isActive = formData.get("isActive") === "true" || formData.get("isActive") === "on";
    const expectedUpdatedAt = (formData.get("expectedUpdatedAt") as string)?.trim();

    if (!id) {
      return { success: false, error: "معرف المنتج مفقود." };
    }

    // Parse features
    const rawFeatures = formData.get("features") as string;
    let features: string[] = [];
    if (rawFeatures) {
      features = rawFeatures
        .split("\n")
        .map((f) => f.trim())
        .filter((f) => f.length > 0);
    }

    // 1. Image handling
    let imagePath = (formData.get("imagePath") as string)?.trim() || "";
    const imageFile = formData.get("imageFile") as File | null;

    if (imageFile && imageFile.size > 0 && imageFile.name) {
      const uploadResult = await handleSafeMediaUpload(imageFile, "image");
      if (!uploadResult.success) {
        return { success: false, error: uploadResult.error };
      }
      imagePath = uploadResult.url!;
      uploadedMedia.push(imagePath);
    }

    if (!imagePath) {
      return { success: false, error: "صورة المنتج مطلوبة." };
    }

    // 2. Video handling
    const removeVideo = formData.get("removeVideo") === "true";
    let videoPath: string | null = null;

    if (!removeVideo) {
      videoPath = (formData.get("videoUrl") as string)?.trim() || null;
      const videoFile = formData.get("videoFile") as File | null;

      if (videoFile && videoFile.size > 0 && videoFile.name) {
        const uploadResult = await handleSafeMediaUpload(videoFile, "video");
        if (!uploadResult.success) {
          uploadedMedia.forEach(removeUploadedMedia);
          return { success: false, error: uploadResult.error };
        }
        videoPath = uploadResult.url!;
        uploadedMedia.push(videoPath);
      }
    }

    const inputData: ProductInputData = {
      id,
      code,
      name,
      categoryKey,
      image: imagePath,
      video: videoPath,
      shortDesc,
      features,
      tag,
      sortOrder: isNaN(sortOrder) ? 0 : sortOrder,
      isActive,
    };

    const result = await updateAdminProduct(id, inputData, expectedUpdatedAt);
    if (!result.success) {
      uploadedMedia.forEach(removeUploadedMedia);
      return { success: false, error: result.error };
    }

    // Invalidate product catalog cache
    revalidateCatalog();

    return { success: true, productId: id };
  } catch (err) {
    uploadedMedia.forEach(removeUploadedMedia);
    console.error("[UPDATE ACTION ERROR]", (err as Error).message);
    return { success: false, error: "تعذر تحديث المنتج بسبب خطأ غير متوقع." };
  }
}

/**
 * Server Action: Toggle Product Active / Inactive State
 * Quick one-click activation/deactivation from the products table.
 */
export async function toggleProductActiveAction(
  productId: string,
  targetActiveState: boolean
): Promise<ActionResponse> {
  // Authorization check inside Server Action
  await requireSuperAdmin();

  if (!productId || typeof productId !== "string") {
    return { success: false, error: "معرف المنتج غير صحيح." };
  }

  const result = await toggleProductActiveState(productId, targetActiveState);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidateCatalog();
  return { success: true, productId };
}

/**
 * Server Action: Delete Product
 * Permanently deletes a product. Allowed when clearly justified.
 */
export async function deleteProductAction(productId: string): Promise<ActionResponse> {
  // Authorization check inside Server Action
  await requireSuperAdmin();

  if (!productId || typeof productId !== "string") {
    return { success: false, error: "معرف المنتج غير صحيح." };
  }

  const result = await deleteAdminProduct(productId);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidateCatalog();
  return { success: true, productId };
}
