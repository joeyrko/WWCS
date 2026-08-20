import type { Metadata, Viewport } from "next";
import { Anton, Inter } from "next/font/google";
import { Toaster } from "sonner";
import { SessionProvider } from "@/components/providers/session-provider";
import { Navbar } from "@/components/layout/navbar";
import { AdminShortcut } from "@/components/admin/admin-shortcut";
import "./globals.css";

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "WWC | World Wrestling Council",
    template: "%s | WWC",
  },
  description:
    "Stream every WWC live pay-per-view event and the full on-demand library — anytime, anywhere.",
  openGraph: {
    title: "WWC | World Wrestling Council",
    description:
      "Stream every WWC live pay-per-view event and the full on-demand library — anytime, anywhere.",
    siteName: "WWC",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WWC | World Wrestling Council",
    description:
      "Stream every WWC live pay-per-view event and the full on-demand library — anytime, anywhere.",
  },
  appleWebApp: {
    capable: true,
    title: "WWC+",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/wwc-logo.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#070707",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${anton.variable} ${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-wwc-black text-wwc-white">
        <div
          aria-hidden
          className="fixed inset-0 -z-50 bg-[url('/wwc-hero-bg.jpg')] bg-cover bg-center opacity-[0.08]"
        />
        <SessionProvider>
          <AdminShortcut />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: "#161616",
                border: "1px solid #2e2e2e",
                color: "#f7f7f7",
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
