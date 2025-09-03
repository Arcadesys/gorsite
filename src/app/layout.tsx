import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/context/ThemeContext";
import ThemeSettings from "@/components/ThemeSettings";
import { BRAND } from "@/config/brand";
import { AuthProvider } from "@/context/AuthContext";
import ConditionalFooter from "@/components/ConditionalFooter";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${BRAND.studioName} — Digital Art Studio`,
  description: `Portfolio and commissions for ${BRAND.studioName}`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body 
        className={`${inter.className} min-h-screen flex flex-col transition-colors duration-200`}
        suppressHydrationWarning
      >
          <AuthProvider>
            <ThemeProvider>
              <div className="flex flex-col min-h-screen dark:bg-black dark:text-white light:bg-gray-50 light:text-gray-900">
                <Header />
                <main className="flex-grow">{children}</main>
                <ConditionalFooter />
                <ThemeSettings />
              </div>
            </ThemeProvider>
          </AuthProvider>
      </body>
    </html>
  );
}
