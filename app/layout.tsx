import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "سامانه مدیریت پروژه‌های بانک سپه",
  description: "سامانه یکپارچه تعریف، پایش و راهبری پروژه‌های بانک سپه",
  icons: {
    icon: "/mob.banking.android.sepah_512x512.webp",
    shortcut: "/mob.banking.android.sepah_512x512.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
