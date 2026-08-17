import type { Metadata } from "next";
import { Geist_Mono, Inter, Noto_Sans } from "next/font/google";
import { CurrencyStoreProvider } from "@/components/currency-store-provider";
import AuthProvider from "@/components/providers/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/lib/cart-context";
import { AppI18nProvider } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s — Bankai Project",
    default: "Bankai Project",
  },
  description:
    "Premium products at Bankai Project. Discover our curated collection.",
  icons: {
    icon: "/favicon.webp",
  },
  openGraph: {
    title: "Bankai Project",
    description:
      "Premium products at Bankai Project. Discover our curated collection.",
    siteName: "Bankai Project",
    type: "website",
  },
};

const notoSansHeading = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable,
        notoSansHeading.variable,
      )}
    >
      <body>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <AppI18nProvider>
                <CartProvider>
                  <CurrencyStoreProvider>
                    <SiteHeader />
                    {children}
                  </CurrencyStoreProvider>
                </CartProvider>
                <ToastProvider />
              </AppI18nProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
