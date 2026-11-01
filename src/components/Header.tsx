"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useProfileStore } from "@/stores/useProfileStore";
import { useWorkoutSessionStore } from "@/stores/useWorkoutSessionStore";
import { ProfileDrawer } from "@/components/ProfileDrawer";
import { Flame, CheckCircle2, LogOut, AlertCircle, ChevronDown, Check, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const {
    activeProfile,
    profiles,
    switchProfile,
    initAuthSession,
    refreshStats,
    signOut,
  } = useProfileStore();

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [showAthleteMenu, setShowAthleteMenu] = useState(false);

  const { isLiveSession, loadUserMaxes } = useWorkoutSessionStore();

  // Inicializar sesión de autenticación al montar
  useEffect(() => {
    if (pathname !== "/login") {
      initAuthSession();
    }
  }, [pathname, initAuthSession]);

  // Cargar 1RMs del usuario cuando el perfil esté listo
  useEffect(() => {
    if (activeProfile?.id) {
      loadUserMaxes(activeProfile.id);
    }
  }, [activeProfile?.id, loadUserMaxes]);

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

            {/* Selector Dinámico de Atletas BIIO */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAthleteMenu(!showAthleteMenu)}
                className="px-2.5 py-1.5 text-xs font-black uppercase tracking-wider rounded-full shadow-md select-none transition-transform duration-200 active:scale-95 cursor-pointer flex items-center gap-1.5 focus:outline-none min-h-[36px]"
                style={{
                  backgroundColor: accentColor,
                  color: isGirl ? "#ffffff" : "#000000",
                }}
                title="Conmutar atleta o ver ajustes"
              >
                <span>{activeProfile.displayName}</span>
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 transition-transform duration-200",
                    showAthleteMenu ? "rotate-180" : ""
                  )}
                />
              </button>

              <AnimatePresence>
                {showAthleteMenu && (
                  <>
                    {/* Backdrop para cerrar al tocar fuera */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowAthleteMenu(false)}
                    />

                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-zinc-950/95 border border-zinc-800 p-2 shadow-2xl z-50 backdrop-blur-md space-y-1"
                    >
                      <div className="px-2 py-1 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold border-b border-zinc-900 pb-1.5 mb-1">
                        <span>Atletas ({profiles.length})</span>
                        <span>BIIO OS</span>
                      </div>

                      <div className="max-h-56 overflow-y-auto space-y-1">
                        {profiles.map((p) => {
                          const isCurrent = p.id === activeProfile.id;
                          const isPgirl =
                            p.sex === "female" || p.gender === "female" || p.role === "hoplita_girl";
                          return (
                            <button
                              key={p.id}
                              type="button"
                              data-athlete-id={p.id}
                              data-athlete-option
                              onClick={() => {
                                switchProfile(p.id);
                                setShowAthleteMenu(false);
                              }}
                              className={cn(
                                "w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-all min-h-[40px]",
                                isCurrent
                                  ? "bg-zinc-800/80 text-white font-black"
                                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                              )}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{
                                    backgroundColor: isPgirl ? "#F43F5E" : "#CCFF00",
                                  }}
                                />
                                <span className="truncate">{p.displayName}</span>
                                <span className="text-[9px] font-mono text-zinc-500 uppercase shrink-0">
                                  ({isPgirl ? "Mujer" : "Hombre"})
                                </span>
                              </div>
                              {isCurrent && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      <div className="pt-1.5 border-t border-zinc-900">
                        <button
                          type="button"
                          data-profile-settings
                          onClick={() => {
                            setShowAthleteMenu(false);
                            setIsProfileDrawerOpen(true);
                          }}
                          className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold text-zinc-300 hover:text-white hover:bg-zinc-900 flex items-center gap-2 transition-all min-h-[40px]"
                        >
                          <Settings className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Ajustes & 1RM ({activeProfile.displayName})</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
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
      {/* Drawer Deslizante de Ajustes de Perfil y 1RM */}
      <ProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
      />
    </>
  );
};
