import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ClientLayout from "@/components/layout/ClientLayout";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Silk & Heritage - Premium Sarees Collection",
  description: "Discover beautiful, authentic sarees from trusted vendors. Shop the finest collection of traditional and modern sarees.",
  keywords: "sarees, bangladeshi clothing, traditional wear, ethnic wear, silk sarees, cotton sarees",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
