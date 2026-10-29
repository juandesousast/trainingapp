"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useProfileStore } from "@/stores/useProfileStore";
import { useWorkoutSessionStore } from "@/stores/useWorkoutSessionStore";
import { Flame, CheckCircle2, LogOut, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const {
    activeProfile,
    initAuthSession,
    refreshStats,
    signOut,
  } = useProfileStore();

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Inicializar sesión de autenticación al montar
  useEffect(() => {
    if (pathname !== "/login") {
      initAuthSession();
    }
  }, [pathname, initAuthSession]);

  const { isLiveSession } = useWorkoutSessionStore();

  // Si estamos en la página de login o en entrenamiento activo, no mostrar la cabecera global
  if (pathname === "/login" || isLiveSession) {
    return null;
  }

  const accentColor = activeProfile.themeAccent;
  const isGirl = activeProfile.role === "hoplita_girl" || activeProfile.gender === "female";

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    await signOut();
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

          {/* Métricas del usuario activo y badge */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Racha dinámica (Streak en días) */}
            <div
              className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-full px-2.5 py-1 text-xs font-mono tabular-nums font-bold text-zinc-300 transition-all shadow-sm"
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
              <span className="font-mono tabular-nums">{activeProfile.streakDays}d</span>
            </div>

            {/* Progreso Semanal dinámico (X/Y) */}
            <div
              className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-full px-2.5 py-1 text-xs font-mono tabular-nums font-bold text-zinc-300 transition-all shadow-sm"
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
              <span className="font-mono tabular-nums">
                {activeProfile.weeklyCompleted}/{activeProfile.weeklyTarget}
              </span>
            </div>

            {/* Badge único del Usuario Autenticado */}
            <div
              className="px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-full shadow-md select-none transition-colors duration-300"
              style={{
                backgroundColor: accentColor,
                color: isGirl ? "#ffffff" : "#000000",
              }}
            >
              {activeProfile.displayName}
            </div>

            {/* Botón Logout */}
            <button
              onClick={() => setShowLogoutDialog(true)}
              disabled={isLoggingOut}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-900/50 transition-all duration-200 active:scale-95 shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Modal / Diálogo Estilizado de Cierre de Sesión (Dark Kinetic) */}
      <AnimatePresence>
        {showLogoutDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-white uppercase tracking-tight">
                    ¿Cerrar sesión?
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Tendrás que volver a ingresar tus credenciales para acceder a tus entrenamientos.
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogoutDialog(false)}
                  disabled={isLoggingOut}
                  className="min-h-[48px] flex-1 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider bg-zinc-900 text-zinc-300 hover:bg-zinc-800 transition-all duration-200 active:scale-95 flex items-center justify-center"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLogout}
                  disabled={isLoggingOut}
                  className="min-h-[48px] flex-1 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5"
                >
                  {isLoggingOut ? (
                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Cerrar sesión</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
