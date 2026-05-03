"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  {
    label: "Tablero de Gestión",
    href: "/dashboard",
    adminOnly: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125Z" />
      </svg>
    ),
  },
  {
    label: "Crear Ticket",
    href: "/dashboard/crear",
    adminOnly: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
  {
    label: "Panel de Métricas",
    href: "/dashboard/metricas",
    adminOnly: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
  {
    label: "Usuarios",
    href: "/dashboard/usuarios",
    adminOnly: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
  },
  {
    label: "Configuración",
    href: "/dashboard/config",
    adminOnly: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.127c-.332.183-.582.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  // Filtrar items según rol del usuario
  const visibleItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-16 lg:w-64 flex-col bg-navy-950 text-white transition-[width,background-color] duration-300 shadow-xl overflow-hidden">
      {/* Logo Section */}
      <div className="flex h-16 items-center gap-3 px-5 border-b border-navy-800/50 bg-navy-950">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-white rounded-lg p-1 shadow-lg overflow-hidden group-hover:scale-105 transition-[transform]">
          <img src="/logo.png" alt="Logo Uniajc" className="w-full h-full object-contain" />
        </div>
        <div className="hidden lg:flex flex-col">
          <span className="text-sm font-black tracking-tighter text-white uppercase leading-none">
            Mesa de Ayuda
          </span>
          <span className="text-[10px] text-accent-yellow-400 font-bold uppercase tracking-[0.2em] mt-0.5">
            Uniajc
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 p-3 mt-4">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger className="w-full text-left">
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-[background-color,color,transform,box-shadow] duration-200 group relative",
                    isActive
                      ? "bg-accent-yellow-500 text-navy-950 shadow-md translate-x-1"
                      : "text-navy-300 hover:bg-navy-800/50 hover:text-white"
                  )}
                >
                  <div className={cn(
                    "transition-[transform] duration-200 group-hover:scale-110",
                    isActive ? "text-navy-950" : "text-navy-400 group-hover:text-accent-yellow-400"
                  )}>
                    {item.icon}
                  </div>
                  <span className="hidden lg:block whitespace-nowrap">{item.label}</span>
                  {isActive && (
                    <div className="absolute left-0 w-1 h-6 bg-navy-950 rounded-r-full -ml-3 hidden lg:block" />
                  )}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="lg:hidden bg-navy-900 border-navy-700 text-white">
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      {/* Bottom section with institutional link or something else */}
      <div className="p-4 border-t border-navy-800/50">
        <div className="hidden lg:flex flex-col gap-1 items-center justify-center opacity-40 hover:opacity-100 transition-[opacity]">
           <span className="text-[9px] font-bold text-navy-400 uppercase tracking-widest text-center">
             Proyecto Mesa de Ayuda
           </span>
           <span className="text-[8px] text-navy-500 font-medium">v1.2.0-redesign</span>
        </div>
      </div>
    </aside>
  );
}
