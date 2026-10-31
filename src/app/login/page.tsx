"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useProfileStore } from "@/stores/useProfileStore";
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const { initAuthSession } = useProfileStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
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
    } catch (err: any) {
      console.error("Auth error:", err);
      setErrorMessage(
        err.message === "Invalid login credentials"
          ? "Correo o contraseña incorrectos."
          : err.message || "Error al iniciar sesión. Inténtalo de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center px-4 py-8 select-none overflow-hidden">
      {/* Luces cinéticas de fondo */}
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full blur-[130px] opacity-20 bg-[#CCFF00] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full blur-[130px] opacity-15 bg-[#F43F5E] pointer-events-none" />

      {/* Tarjeta de Login */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-sm z-10 space-y-6"
      >
        {/* Cabecera / Identidad */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center font-black text-black text-xl tracking-tighter bg-[#CCFF00] shadow-2xl shadow-[#CCFF00]/20">
            HOS
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-widest text-white">
              HOPLITA OS
            </h1>
            <p className="text-[11px] font-mono tracking-wider uppercase text-zinc-400">
              Sistema Cinético · Acceso Privado BIIO
            </p>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-xl shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
            <h2 className="text-xs font-mono font-bold tracking-widest uppercase text-zinc-400">
              Iniciar Sesión
            </h2>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
              Privado
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full min-h-[48px] bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-100 font-medium placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00] transition-colors"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full min-h-[48px] bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-12 py-3 text-sm text-zinc-100 font-mono tracking-wider placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-colors"
                  aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
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
              disabled={isLoading || !email || !password}
              className="w-full mt-2 min-h-[52px] py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-black bg-[#CCFF00] flex items-center justify-center gap-2 shadow-xl shadow-[#CCFF00]/10 transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-105"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Entrar al Sistema</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Seguridad */}
        <div className="flex items-center justify-center gap-2 text-zinc-400 text-[11px] font-mono text-center">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
          <span>Acceso privado · Aislamiento total de datos con RLS</span>
        </div>
      </motion.div>
    </div>
  );
}
