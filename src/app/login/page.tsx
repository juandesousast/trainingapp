"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useProfileStore } from "@/stores/useProfileStore";
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff, Sparkles, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AccountPreset {
  id: "juan" | "wendy" | "nato";
  name: string;
  email: string;
  role: "hoplita" | "hoplita_girl";
  gender: "male" | "female";
  color: string;
  tag: string;
}

const PRESET_ACCOUNTS: AccountPreset[] = [
  {
    id: "juan",
    name: "Juan",
    email: "juan@hoplita.app",
    role: "hoplita",
    gender: "male",
    color: "#CCFF00",
    tag: "Él · Hoplita",
  },
  {
    id: "wendy",
    name: "Wendy",
    email: "wendy@hoplita.app",
    role: "hoplita_girl",
    gender: "female",
    color: "#F43F5E",
    tag: "Ella · Girl",
  },
  {
    id: "nato",
    name: "Nato",
    email: "nato@hoplita.app",
    role: "hoplita",
    gender: "male",
    color: "#CCFF00",
    tag: "Él · Hoplita",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { initAuthSession } = useProfileStore();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [selectedPreset, setSelectedPreset] = useState<"juan" | "wendy" | "nato">("juan");
  const [email, setEmail] = useState("juan@hoplita.app");
  const [password, setPassword] = useState("Juan2026$");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentPreset = PRESET_ACCOUNTS.find((p) => p.id === selectedPreset) || PRESET_ACCOUNTS[0];
  const accentColor = currentPreset.color;

  const handleSelectPreset = (presetId: "juan" | "wendy" | "nato") => {
    setSelectedPreset(presetId);
    setErrorMessage(null);
    if (presetId === "juan") {
      setEmail("juan@hoplita.app");
      setPassword("Juan2026$");
    } else if (presetId === "wendy") {
      setEmail("wendy@hoplita.app");
      setPassword("Wendy2026$");
    } else if (presetId === "nato") {
      setEmail("nato@hoplita.app");
      setPassword("Nato2026$");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) {
          throw error;
        }

        if (data.session) {
          await initAuthSession();
          router.replace("/");
        }
      } else {
        // Registro
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              role: currentPreset.role,
              gender: currentPreset.gender,
              name: currentPreset.name,
            },
          },
        });

        if (error) {
          throw error;
        }

        if (data.session) {
          await initAuthSession();
          router.replace("/");
        } else {
          setErrorMessage("Cuenta creada con éxito. Inicia sesión ahora.");
          setMode("login");
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setErrorMessage(err.message || "Error al autenticar. Verifica tus credenciales.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center px-4 py-8 select-none overflow-hidden">
      {/* Luces cinéticas de fondo */}
      <div
        className="absolute -top-32 -left-32 w-80 h-80 rounded-full blur-[130px] opacity-25 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: accentColor }}
      />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full blur-[130px] opacity-20 bg-zinc-800 pointer-events-none" />

      {/* Tarjeta de Login */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-sm z-10 space-y-6"
      >
        {/* Cabecera / Identidad */}
        <div className="text-center space-y-2">
          <div
            className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center font-black text-black text-xl tracking-tighter shadow-2xl transition-all duration-300"
            style={{ backgroundColor: accentColor }}
          >
            HOS
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-widest text-white">
              HOPLITA OS
            </h1>
            <p className="text-[11px] font-mono tracking-wider uppercase text-zinc-400">
              Sistema Cinético · Autenticación BIIO
            </p>
          </div>
        </div>

        {/* Selector de Cuentas Iniciales (Juan / Wendy / Nato) */}
        <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-1.5 flex gap-1.5">
          {PRESET_ACCOUNTS.map((preset) => {
            const isSelected = selectedPreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id)}
                className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex flex-col items-center justify-center ${
                  isSelected
                    ? "shadow-lg text-black"
                    : "text-zinc-400 hover:text-white"
                }`}
                style={{
                  backgroundColor: isSelected ? preset.color : "transparent",
                  color: isSelected
                    ? preset.id === "wendy"
                      ? "#ffffff"
                      : "#000000"
                    : undefined,
                }}
              >
                <span className="font-black text-sm">{preset.name}</span>
                <span className="text-[9px] font-mono opacity-80">{preset.tag}</span>
              </button>
            );
          })}
        </div>

        {/* Formulario */}
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-xl shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-zinc-800/60">
            <h2 className="text-xs font-mono font-bold tracking-widest uppercase text-zinc-400">
              {mode === "login" ? "Acceso Seguro" : "Nuevo Registro"}
            </h2>
            <span
              className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${accentColor}18`,
                color: accentColor,
              }}
            >
              {currentPreset.name} · {currentPreset.role}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@hoplita.app"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-100 font-medium placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-11 py-3 text-sm text-zinc-100 font-mono tracking-wider placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Mensaje de Error */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs font-medium"
                >
                  {errorMessage}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-black flex items-center justify-center gap-2 shadow-xl transition-all duration-200 active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: accentColor }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === "login" ? "Entrar al Sistema" : "Crear Perfil"}</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Login / Register */}
          <div className="pt-2 text-center border-t border-zinc-800/60">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setErrorMessage(null);
              }}
              className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors font-medium"
            >
              {mode === "login" ? (
                <>
                  ¿Crear nueva cuenta?{" "}
                  <span className="font-bold underline" style={{ color: accentColor }}>
                    Regístrate aquí
                  </span>
                </>
              ) : (
                <>
                  ¿Ya tienes cuenta?{" "}
                  <span className="font-bold underline" style={{ color: accentColor }}>
                    Inicia sesión
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Seguridad */}
        <div className="flex items-center justify-center gap-2 text-zinc-500 text-[11px] font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Aislamiento de datos con Row Level Security (RLS)</span>
        </div>
      </motion.div>
    </div>
  );
}
