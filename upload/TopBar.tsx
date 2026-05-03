"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TopBar() {
  const { user, signOut, role } = useAuth();
  const router = useRouter();
  const userInitial = user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || "U";

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Search Bar central */}
      <div className="flex-1 max-w-xl mx-auto hidden md:block">
        <div className="relative group">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-navy-600 transition-colors"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <Input
            name="search"
            placeholder="Buscar por ID, usuario o problema…"
            autoComplete="off"
            className="w-full pl-10 bg-slate-50 border-transparent focus:bg-white focus:border-navy-200 transition-[background-color,border-color] rounded-full h-10 text-sm"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon" aria-label="Notificaciones" className="text-gray-500 hover:text-navy-900 relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                />
              </svg>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden rounded-2xl border-none shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="bg-navy-900 p-4">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Notificaciones</h3>
            </div>
            <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 bg-white">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-navy-950 uppercase tracking-tight">Todo al día</p>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">No tienes notificaciones pendientes en este momento.</p>
              </div>
              <Button variant="outline" className="w-full text-xs font-bold border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl" onClick={() => {}}>
                Marcar todas como leídas
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div role="button" aria-label="Menú de usuario" className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors group cursor-pointer">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-100 text-navy-800 font-semibold text-xs border border-navy-200 group-hover:bg-navy-200 transition-colors">
                {userInitial}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-navy-900 leading-none">
                  {user?.displayName || (user?.email?.split('@')[0])}
                </p>
                <p className="text-[10px] text-gray-400 leading-none mt-1 uppercase tracking-wider font-bold">
                  {role === "admin" ? "Administrador" : "Usuario"}
                </p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-3 h-3 text-gray-400"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/dashboard/perfil')}>
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50" onClick={signOut}>
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
