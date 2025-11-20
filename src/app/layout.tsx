import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/components/providers/auth-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "BizTree",
  description: "SaaS platform for local businesses",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk">
      <body suppressHydrationWarning className={cn(inter.variable, "antialiased bg-gray-50 text-gray-900 font-sans")}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
