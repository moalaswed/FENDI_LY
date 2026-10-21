import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { COMPANY } from "@/data/company";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#520000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://fendi.ly"),
  title: `${COMPANY.brandName.fullAr} | FENDI Plastic Industry`,
  description:
    "شركة ليبية رائدة في تصنيع المنتجات البلاستيكية عالية المتانة. تمديدات كهربائية وقرجوطة، براميل صناعية، مستلزمات زراعية وبيوت محمية، وأدوات منزلية بالجملة والقطاعي.",
  keywords: [
    "الفاندي للبلاستيك",
    "FENDI Plastic Industry",
    "قرجوطة الفاندي",
    "مصنع الفاندي",
    "شركة النجيلة للصناعات البلاستيكية",
    "مواسير كهربائية مرنة ليبيا",
    "براميل بلاستيك ليبيا",
    "بلاستيك بالجملة والقطاعي طرابلس",
  ],
  authors: [{ name: COMPANY.brandName.fullAr, url: "https://www.fendi.ly" }],
  creator: COMPANY.brandName.fullAr,
  publisher: COMPANY.brandName.fullAr,
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "ar_LY",
    url: "https://www.fendi.ly",
    title: `${COMPANY.brandName.fullAr} | جودة تصنيع وطنية`,
    description:
      "المصنع الرائد للمنتجات والتأسيسات البلاستيكية في ليبيا. تصفح المنتجات واستفسر مباشرة عبر WhatsApp.",
    siteName: COMPANY.brandName.fullAr,
    images: [
      {
        url: "/photo_30_2026-10-20_20-13-23.jpg",
        width: 1200,
        height: 800,
        alt: `${COMPANY.brandName.fullAr} - منتجات وبراميل الفاندي`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: COMPANY.brandName.fullAr,
    description: "صناعة بلاستيكية ليبية بمواصفات قياسية بالجملة والقطاعي.",
    images: ["/photo_30_2026-10-20_20-13-23.jpg"],
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} font-sans`}>
      <body className="min-h-screen bg-[#111111] text-[#B8B8B8] antialiased selection:bg-[#A50000] selection:text-white flex flex-col">
        {children}
      </body>
    </html>
  );
}
