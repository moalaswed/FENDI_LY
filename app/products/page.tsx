import { Suspense } from "react";
import { io } from "next/cache";
import type { Metadata } from "next";
import Header from "@/components/Header";
import ProductCatalog from "@/components/ProductCatalog";
import Footer from "@/components/Footer";
import { COMPANY } from "@/data/company";
import { getProducts } from "@/lib/products";

async function LiveProductCatalog() {
  await io();
  const { products, categories, error } = await getProducts();
  return (
    <ProductCatalog
      isPage={true}
      initialProducts={products}
      initialCategories={categories}
      error={error}
    />
  );
}

function ProductCatalogFallback() {
  return (
    <section
      id="products"
      className="pt-28 sm:pt-36 lg:pt-40 pb-20 md:pb-32 bg-[#151515] min-h-[60vh]"
      aria-busy="true"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-right">
        <p role="status" className="text-sm text-[#B8B8B8]">
          جارٍ تحميل كتالوج المنتجات من قاعدة البيانات...
        </p>
      </div>
    </section>
  );
}

export const metadata: Metadata = {
  title: `كتالوج المنتجات | ${COMPANY.brandName.fullAr}`,
  description:
    "استكشف كافة منتجات شركة الفاندي للصناعات البلاستيكية في ليبيا: مواسير قرجوطة كهربائية مرنة، براميل صناعية HDPE، مستلزمات زراعية وبيوت محمية، وأدوات تنظيمية. اطلب بالجملة أو القطاعي مع استفسار فوري عبر واتساب.",
  keywords: [
    "كتالوج منتجات الفاندي",
    "قرجوطة كهربائية ليبيا",
    "براميل بلاستيك طرابلس",
    "مستلزمات زراعية الفاندي",
    "بلاستيك بالجملة ليبيا",
    "FENDI Plastic products",
  ],
  openGraph: {
    type: "website",
    locale: "ar_LY",
    url: "https://www.fendi.ly/products",
    title: `كتالوج المنتجات | ${COMPANY.brandName.fullAr}`,
    description:
      "تصفح تشكيلة منتجات الفاندي للبلاستيك المصنعة محلياً بأعلى مواصفات البولي إيثيلين والبولي بروبيلين واستفسر فورياً عبر WhatsApp.",
    siteName: COMPANY.brandName.fullAr,
    images: [
      {
        url: "/photo_38_2026-10-20_20-13-24.jpg",
        width: 1200,
        height: 800,
        alt: `كتالوج منتجات ${COMPANY.brandName.fullAr}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `كتالوج المنتجات | ${COMPANY.brandName.fullAr}`,
    description: "تصفح تشكيلة منتجات الفاندي للبلاستيك في ليبيا بالجملة والقطاعي.",
    images: ["/photo_38_2026-10-20_20-13-24.jpg"],
  },
};

export default function ProductsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#111111] text-[#B8B8B8] selection:bg-[#A50000] selection:text-white">
      {/* Header / Navbar */}
      <Header />

      <main className="flex-1">
        {/* Full Interactive Product Catalog powered by MariaDB */}
        <Suspense fallback={<ProductCatalogFallback />}>
          <LiveProductCatalog />
        </Suspense>
      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}
