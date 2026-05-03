import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import ClientLayout from "@/components/layout/ClientLayout";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "Mesa de Ayuda TI - Sistema de Tickets",
  description:
    "Sistema de gestión de tickets de soporte técnico con tablero Kanban.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn("min-h-screen bg-background antialiased")}>
        <TooltipProvider>
          <ClientLayout>{children}</ClientLayout>
        </TooltipProvider>
      </body>
    </html>
  );
}
