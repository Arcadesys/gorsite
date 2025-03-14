import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/context/ThemeContext";
import ThemeSettings from "@/components/ThemeSettings";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gorath - Digital Artist & Illustrator",
  description: "Portfolio and commission website for digital artist Gorath",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} dark:bg-black dark:text-white light:bg-gray-50 light:text-gray-900 min-h-screen flex flex-col transition-colors duration-200`}>
        <AuthProvider>
          <ThemeProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
              <ThemeSettings />
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
