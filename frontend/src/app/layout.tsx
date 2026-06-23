import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Madeline_chocolate | Handcrafted Chocolates & Return Gifts",
    template: "%s | Madeline_chocolate",
  },
  description:
    "Budget-friendly return gifts starting from ₹20. Handcrafted chocolates and customized gifts for birthdays, weddings, baby showers, and special occasions.",
  keywords: [
    "return gifts",
    "chocolates",
    "homemade chocolate",
    "Madeline chocolate",
    "customized gifts",
    "Chennai",
  ],
  openGraph: {
    title: "Madeline_chocolate",
    description: "Handcrafted chocolates & return gifts from ₹20",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} min-h-screen flex flex-col antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
