import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Mesa de Ayuda TI - UNIAJC",
  description: "Sistema de gestión de tickets de soporte técnico - Universidad Antonio José Camacho",
  keywords: ["UNIAJC", "Mesa de Ayuda", "Help Desk", "Soporte TI", "Tickets"],
  authors: [{ name: "Universidad Antonio José Camacho" }],
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen bg-background text-foreground antialiased`} style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
