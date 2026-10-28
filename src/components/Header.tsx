"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useProfileStore } from "@/stores/useProfileStore";
import { Flame, CheckCircle2, LogOut, Eye, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const {
    activeProfile,
    myProfileSlug,
    isConsultationMode,
    toggleConsultationProfile,
    initAuthSession,
    refreshStats,
    signOut,
  } = useProfileStore();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Inicializar sesión de autenticación al montar
  useEffect(() => {
    if (pathname !== "/login") {
      initAuthSession();
    }
  }, [pathname, initAuthSession]);

  // Si estamos en la página de login, no mostrar la cabecera del dashboard
  if (pathname === "/login") {
    return null;
  }

  const isHoplita = activeProfile.slug === "hoplita";
  const accentColor = activeProfile.themeAccent;

  const handleLogout = async () => {
    if (window.confirm("¿Deseas cerrar tu sesión en Hoplita OS?")) {
      setIsLoggingOut(true);
      await signOut();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {/* Logo & Marca */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-black text-sm tracking-tighter shadow-lg transition-colors duration-300"
              style={{ backgroundColor: accentColor }}
            >
              HOS
            </div>
            <div>
              <h1 className="text-xs font-black tracking-widest text-zinc-400 uppercase">
                HOPLITA OS
              </h1>
              <p className="text-[11px] font-semibold text-zinc-200 tracking-tight">
                DARK KINETIC BIIO
              </p>
            </div>
          </div>

          {/* Selector de Perfil, Racha y Controles */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Racha dinámica (Streak en días consecutivos) */}
            <div
              className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-full px-2 py-1 text-xs font-mono font-bold text-zinc-300 transition-all"
              title={`Racha: ${activeProfile.streakDays} días consecutivos de actividad`}
            >
              <Flame
                className={cn(
                  "w-3.5 h-3.5 transition-colors",
                  activeProfile.streakDays > 0
                    ? "text-amber-500 fill-amber-500 animate-pulse"
                    : "text-zinc-500"
                )}
              />
              <span>{activeProfile.streakDays}d</span>
            </div>

            {/* Progreso Semanal dinámico (X/Y) */}
            <div
              className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-full px-2 py-1 text-xs font-mono font-bold text-zinc-300 transition-all"
              title={`Progreso semanal: ${activeProfile.weeklyCompleted} de ${activeProfile.weeklyTarget}`}
            >
              <CheckCircle2
                className="w-3.5 h-3.5 transition-colors"
                style={{
                  color:
                    activeProfile.weeklyCompleted >= activeProfile.weeklyTarget
                      ? "#10B981"
                      : accentColor,
                }}
              />
              <span>
                {activeProfile.weeklyCompleted}/{activeProfile.weeklyTarget}
              </span>
            </div>

            {/* Switcher Pareja: ÉL / ELLA */}
            <div className="relative flex bg-zinc-900 border border-zinc-800 rounded-full p-0.5">
              <button
                onClick={() => toggleConsultationProfile("hoplita")}
                className={cn(
                  "px-2.5 py-1 text-xs font-bold rounded-full transition-all duration-200 flex items-center gap-1",
                  isHoplita
                    ? "bg-[#CCFF00] text-black shadow-md font-extrabold"
                    : "text-zinc-400 hover:text-white"
                )}
                title={
                  myProfileSlug === "hoplita"
                    ? "Mi perfil activo"
                    : "Consultar progreso de Hoplita"
                }
              >
                <span>Él</span>
                {myProfileSlug === "hoplita" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-black/60 inline-block" />
                )}
              </button>

              <button
                onClick={() => toggleConsultationProfile("hoplita_girl")}
                className={cn(
                  "px-2.5 py-1 text-xs font-bold rounded-full transition-all duration-200 flex items-center gap-1",
                  !isHoplita
                    ? "bg-[#F43F5E] text-white shadow-md font-extrabold"
                    : "text-zinc-400 hover:text-white"
                )}
                title={
                  myProfileSlug === "hoplita_girl"
                    ? "Mi perfil activo"
                    : "Consultar progreso de Hoplita Girl"
                }
              >
                <span>Ella</span>
                {myProfileSlug === "hoplita_girl" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60 inline-block" />
                )}
              </button>
            </div>

            {/* Botón Logout */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="p-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-900/50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Banner de Modo Consulta si está viendo a la pareja */}
      {isConsultationMode && (
        <div className="w-full bg-zinc-900/95 border-b border-zinc-800 py-1 px-4 text-center text-[11px] font-mono flex items-center justify-center gap-2 text-zinc-300">
          <Eye className="w-3.5 h-3.5" style={{ color: accentColor }} />
          <span>
            Modo Consulta: viendo progreso de{" "}
            <strong className="text-white">{activeProfile.displayName}</strong>
          </span>
          <button
            onClick={() => toggleConsultationProfile(myProfileSlug)}
            className="ml-2 underline font-bold text-xs"
            style={{ color: accentColor }}
          >
            Volver a mi perfil
          </button>
        </div>
      )}
    </>
  );
};
