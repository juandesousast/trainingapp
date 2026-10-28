"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useProfileStore } from "@/stores/useProfileStore";
import { Flame, CheckCircle2, LogOut, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const {
    activeProfile,
    allProfiles,
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

  const accentColor = activeProfile.themeAccent;

  const handleLogout = async () => {
    if (window.confirm("¿Deseas cerrar tu sesión en Hoplita OS?")) {
      setIsLoggingOut(true);
      await signOut();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2">
          {/* Logo & Marca */}
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-black text-black text-xs sm:text-sm tracking-tighter shadow-lg transition-colors duration-300"
              style={{ backgroundColor: accentColor }}
            >
              HOS
            </div>
            <div>
              <h1 className="text-[11px] sm:text-xs font-black tracking-widest text-zinc-400 uppercase">
                HOPLITA OS
              </h1>
              <p className="text-[10px] sm:text-[11px] font-semibold text-zinc-200 tracking-tight">
                DARK KINETIC BIIO
              </p>
            </div>
          </div>

          {/* Selector de Perfil, Racha y Controles */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Racha dinámica (Streak en días) */}
            <div
              className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-full px-2 py-0.5 text-xs font-mono font-bold text-zinc-300 transition-all"
              title={`Racha: ${activeProfile.streakDays} días consecutivos de actividad`}
            >
              <Flame
                className={cn(
                  "w-3 h-3 transition-colors",
                  activeProfile.streakDays > 0
                    ? "text-amber-500 fill-amber-500 animate-pulse"
                    : "text-zinc-500"
                )}
              />
              <span>{activeProfile.streakDays}d</span>
            </div>

            {/* Progreso Semanal dinámico (X/Y) */}
            <div
              className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-full px-2 py-0.5 text-xs font-mono font-bold text-zinc-300 transition-all"
              title={`Progreso semanal: ${activeProfile.weeklyCompleted} de ${activeProfile.weeklyTarget}`}
            >
              <CheckCircle2
                className="w-3 h-3 transition-colors"
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

            {/* Switcher de Usuarios (Juan / Wendy / Nato) */}
            <div className="relative flex bg-zinc-900 border border-zinc-800 rounded-full p-0.5">
              {allProfiles.map((p) => {
                const isActive = activeProfile.slug === p.slug;
                const isMe = myProfileSlug === p.slug;
                const isGirl = p.role === "hoplita_girl" || p.gender === "female";

                return (
                  <button
                    key={p.slug}
                    onClick={() => toggleConsultationProfile(p.slug)}
                    className={cn(
                      "px-2 py-0.5 text-xs font-bold rounded-full transition-all duration-200 flex items-center gap-1",
                      isActive
                        ? isGirl
                          ? "bg-[#F43F5E] text-white shadow-md font-extrabold"
                          : "bg-[#CCFF00] text-black shadow-md font-extrabold"
                        : "text-zinc-400 hover:text-white"
                    )}
                    title={
                      isMe
                        ? `Mi perfil (${p.displayName})`
                        : `Consultar progreso de ${p.displayName}`
                    }
                  >
                    <span>{p.displayName}</span>
                    {isMe && (
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full inline-block",
                          isActive
                            ? isGirl
                              ? "bg-white"
                              : "bg-black"
                            : "bg-[#CCFF00]"
                        )}
                      />
                    )}
                  </button>
                );
              })}
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

      {/* Banner de Modo Consulta si está viendo a otro compañero */}
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
