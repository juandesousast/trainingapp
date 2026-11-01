"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Activity,
  Bluetooth,
  BluetoothConnected,
  BluetoothSearching,
  CheckCircle2,
  Copy,
  Flame,
  Info,
  Radio,
  RefreshCw,
  Send,
  ShieldCheck,
  Terminal,
  Trash2,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { VectorLogo } from "@/components/VectorLogo";
import {
  BLEConnectionStatus,
  RenphoAthleteProfile,
  PRESET_ATHLETES,
  DecodedBiometrics,
  TelemetryLog,
  RENPHO_SERVICES,
  RENPHO_CHARACTERISTICS,
  decodeRenphoPacket,
  buildRenphoProfileHandshake,
  isWebBluetoothSupported,
} from "@/lib/renpho-debug";
import { cn } from "@/lib/utils";

export default function RenphoLabPage() {
  const [status, setStatus] = useState<BLEConnectionStatus>("disconnected");
  const [selectedAthleteKey, setSelectedAthleteKey] = useState<"juan" | "wendy">("juan");
  const [selectedProfile, setSelectedProfile] = useState<RenphoAthleteProfile>(PRESET_ATHLETES.juan);
  const [acceptAllDevices, setAcceptAllDevices] = useState(false);

  // Estado del dispositivo y servicios
  const [deviceInfo, setDeviceInfo] = useState<{
    name: string | null;
    id: string | null;
    services: string[];
    characteristics: string[];
  }>({
    name: null,
    id: null,
    services: [],
    characteristics: [],
  });

  // Telemetría decodificada
  const [latestBiometrics, setLatestBiometrics] = useState<DecodedBiometrics | null>(null);
  const [logs, setLogs] = useState<TelemetryLog[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  // Referencias a los objetos BLE para desconexión y handshake
  const bluetoothDeviceRef = useRef<any>(null);
  const writeCharacteristicRef = useRef<any>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Validar soporte de Web Bluetooth al montar
  useEffect(() => {
    setIsSupported(isWebBluetoothSupported());
    addLog("info", "Laboratorio Renpho BLE inicializado en Modo Seguro.");
    if (!isWebBluetoothSupported()) {
      addLog(
        "warn",
        "Web Bluetooth no detectado en este navegador. Utiliza Google Chrome / Edge en Android o PC con Bluetooth habilitado."
      );
    }
  }, []);

  // Actualizar perfil de handshake al cambiar selector
  const handleAthleteChange = (key: "juan" | "wendy") => {
    setSelectedAthleteKey(key);
    setSelectedProfile(PRESET_ATHLETES[key]);
    addLog(
      "info",
      `Perfil de atleta seleccionado: ${PRESET_ATHLETES[key].name} (${
        PRESET_ATHLETES[key].sex === "male" ? "Hombre" : "Mujer"
      }, ${PRESET_ATHLETES[key].heightCm} cm, ${PRESET_ATHLETES[key].age} años)`
    );
  };

  // Añadir un log con autoscroll
  const addLog = (
    type: TelemetryLog["type"],
    message: string,
    hex?: string
  ) => {
    const timestamp = new Date().toLocaleTimeString("es-ES", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const newLog: TelemetryLog = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp,
      type,
      message,
      hex,
    };

    setLogs((prev) => [...prev.slice(-150), newLog]);
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Limpiar conexión activa
  const disconnectDevice = () => {
    if (bluetoothDeviceRef.current && bluetoothDeviceRef.current.gatt.connected) {
      bluetoothDeviceRef.current.gatt.disconnect();
    }
    bluetoothDeviceRef.current = null;
    writeCharacteristicRef.current = null;
    setStatus("disconnected");
    addLog("info", "Dispositivo desconectado por el usuario.");
  };

  // Manejo de eventos de valor entrante de la característica BLE
  const handleCharacteristicValue = (event: any) => {
    const value = event.target.value as DataView;
    if (!value || value.byteLength === 0) return;

    const bytes = Array.from(new Uint8Array(value.buffer));
    const decoded = decodeRenphoPacket(bytes, selectedProfile);

    setStatus("receiving");
    setLatestBiometrics(decoded);

    const statusText = decoded.isStabilized ? "ESTABILIZADO / FIJADO" : "En medición";
    const impText = decoded.impedance ? ` | Impedancia: ${decoded.impedance} Ω` : "";
    addLog(
      "data",
      `PESO: ${decoded.weightKg ?? "--"} kg (${statusText})${impText}`,
      decoded.rawHex
    );
  };

  // Iniciar escaneo y conexión Web Bluetooth
  const handleScanDevice = async () => {
    if (!isWebBluetoothSupported()) {
      alert(
        "Web Bluetooth no está disponible en este navegador.\n\nPrueba desde Chrome en Android o Chrome/Edge en tu ordenador con Bluetooth activado."
      );
      return;
    }

    try {
      setStatus("scanning");
      addLog("info", "Solicitando emparejamiento BLE con navigator.bluetooth.requestDevice()...");

      const navBluetooth = (navigator as any).bluetooth;

      // Configuración de escaneo
      let requestOptions: any;

      if (acceptAllDevices) {
        requestOptions = {
          acceptAllDevices: true,
          optionalServices: RENPHO_SERVICES,
        };
      } else {
        requestOptions = {
          filters: [
            { namePrefix: "Renpho" },
            { namePrefix: "ES-" },
            { namePrefix: "QN-" },
            { namePrefix: "Scale" },
            { namePrefix: "Chipsea" },
            { services: [0xffe0] },
            { services: [0xfff0] },
            { services: [0x181d] },
          ],
          optionalServices: RENPHO_SERVICES,
        };
      }

      const device = await navBluetooth.requestDevice(requestOptions);
      bluetoothDeviceRef.current = device;

      device.addEventListener("gattserverdisconnected", () => {
        addLog("warn", `Dispositivo "${device.name || "Báscula"}" se ha desconectado.`);
        setStatus("disconnected");
        writeCharacteristicRef.current = null;
      });

      setStatus("connecting");
      addLog("info", `Dispositivo seleccionado: "${device.name || "Sin nombre"}" (ID: ${device.id})`);

      // Conexión GATT
      addLog("info", "Conectando al servidor GATT...");
      const server = await device.gatt.connect();
      addLog("info", "Servidor GATT conectado con éxito.");

      const discoveredServices: string[] = [];
      const discoveredChars: string[] = [];
      let notifyCharFound = false;

      // Recorrer los servicios primarios para encontrar características de notificación
      for (const serviceUuid of RENPHO_SERVICES) {
        try {
          const service = await server.getPrimaryService(serviceUuid);
          const sUuidStr = typeof serviceUuid === "number" ? `0x${serviceUuid.toString(16)}` : serviceUuid;
          discoveredServices.push(sUuidStr);
          addLog("info", `Servicio GATT localizado: ${sUuidStr}`);

          // Buscar características del servicio
          for (const charUuid of RENPHO_CHARACTERISTICS) {
            try {
              const char = await service.getCharacteristic(charUuid);
              const cUuidStr = typeof charUuid === "number" ? `0x${charUuid.toString(16)}` : charUuid;
              discoveredChars.push(cUuidStr);

              // Comprobar si admite escritura para el handshake
              if (char.properties.write || char.properties.writeWithoutResponse) {
                writeCharacteristicRef.current = char;
                addLog("info", `Característica de escritura para handshake disponible: ${cUuidStr}`);
              }

              // Suscribir a notificaciones si las soporta
              if (char.properties.notify || char.properties.indicate) {
                await char.startNotifications();
                char.addEventListener("characteristicvaluechanged", handleCharacteristicValue);
                notifyCharFound = true;
                addLog("info", `Suscripción activa a notificaciones en: ${cUuidStr}`);
              }
            } catch {
              // Característica no presente en este servicio, continuar
            }
          }
        } catch {
          // Servicio no presente, continuar
        }
      }

      setDeviceInfo({
        name: device.name || "Báscula BLE Renpho",
        id: device.id,
        services: discoveredServices,
        characteristics: discoveredChars,
      });

      if (notifyCharFound) {
        setStatus("connected");
        addLog("info", "Conexión completa. Súbete descalzo a la báscula para recibir telemetría...");
        // Enviar handshake inicial automáticamente si hay canal de escritura
        sendHandshakePacket();
      } else {
        setStatus("connected");
        addLog(
          "warn",
          "Conectado al dispositivo pero no se localizó la característica de notificación FFE1/FFF1 estándar. Revisa la consola."
        );
      }
    } catch (err: any) {
      console.error("Error en Web Bluetooth:", err);
      setStatus("error");
      addLog("error", `Error de conexión: ${err.message || err.toString()}`);
    }
  };

  // Enviar paquete de handshake a la báscula
  const sendHandshakePacket = async () => {
    if (!writeCharacteristicRef.current) {
      addLog(
        "warn",
        "No hay característica de escritura disponible para handshake. La báscula enviará peso pasivo."
      );
      return;
    }

    try {
      const packet = buildRenphoProfileHandshake(selectedProfile);
      const hex = Array.from(packet)
        .map((b) => b.toString(16).padStart(2, "0").toUpperCase())
        .join(" ");

      if (writeCharacteristicRef.current.writeValueWithoutResponse) {
        await writeCharacteristicRef.current.writeValueWithoutResponse(packet);
      } else {
        await writeCharacteristicRef.current.writeValue(packet);
      }

      addLog("handshake", `Handshake de perfil enviado a la báscula (${selectedProfile.name})`, hex);
    } catch (err: any) {
      addLog("warn", `No se pudo enviar el paquete de handshake: ${err.message}`);
    }
  };

  // Copiar último payload hexadecimal
  const handleCopyPayload = () => {
    if (!latestBiometrics?.rawHex) return;
    navigator.clipboard.writeText(latestBiometrics.rawHex);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col px-3 py-4 sm:px-6 sm:py-6 max-w-4xl mx-auto space-y-5 selection:bg-[#CCFF00] selection:text-black">
      {/* 1. CABECERA & NAVEGACIÓN */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            title="Volver al inicio"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <VectorLogo size={24} accentColor="#CCFF00" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black tracking-wider uppercase text-white">
                  LABORATORIO RENPHO BLE
                </h1>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950/70 text-cyan-400 border border-cyan-800/60">
                  DIAGNÓSTICO
                </span>
              </div>
              <p className="text-[11px] font-mono text-zinc-400">
                Monitor de Telemetría Web Bluetooth en Tiempo Real
              </p>
            </div>
          </div>
        </div>

        {/* Badge de Estado Dinámico */}
        <div
          className={cn(
            "px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border flex items-center gap-1.5 shadow-sm",
            status === "disconnected" && "bg-zinc-900 text-zinc-400 border-zinc-800",
            status === "scanning" && "bg-amber-950/40 text-amber-400 border-amber-800 animate-pulse",
            status === "connecting" && "bg-cyan-950/40 text-cyan-400 border-cyan-800 animate-pulse",
            status === "connected" && "bg-emerald-950/40 text-emerald-400 border-emerald-800",
            status === "receiving" && "bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/30 shadow-[#CCFF00]/10 shadow-md",
            status === "error" && "bg-rose-950/40 text-rose-400 border-rose-800"
          )}
        >
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              status === "disconnected" && "bg-zinc-500",
              status === "scanning" && "bg-amber-400 animate-ping",
              status === "connecting" && "bg-cyan-400 animate-ping",
              status === "connected" && "bg-emerald-400",
              status === "receiving" && "bg-[#CCFF00] animate-pulse",
              status === "error" && "bg-rose-400"
            )}
          />
          <span className="uppercase">
            {status === "disconnected" && "Desconectado"}
            {status === "scanning" && "Escaneando..."}
            {status === "connecting" && "Conectando..."}
            {status === "connected" && "Conectado"}
            {status === "receiving" && "Recibiendo Datos"}
            {status === "error" && "Error BLE"}
          </span>
        </div>
      </div>

      {/* 2. AVISO DE MODO SEGURO */}
      <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-emerald-200">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold uppercase tracking-wider text-emerald-300 font-mono">
            Modo Seguro Activo:
          </span>{" "}
          Esta pantalla funciona estrictamente como un analizador de protocolos de solo lectura. Ningún
          dato se guardará en la base de datos oficial (`biometric_logs`) ni modificará tus estadísticas.
        </div>
      </div>

      {/* AVISO DE SOPORTE WEB BLUETOOTH */}
      {!isSupported && (
        <div className="bg-rose-950/30 border border-rose-500/40 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-rose-200">
          <Info className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-rose-300 uppercase font-mono block mb-0.5">
              Navegador sin Web Bluetooth:
            </span>
            La API de Web Bluetooth no está habilitada en este navegador. Utiliza{" "}
            <strong>Google Chrome</strong> o <strong>Microsoft Edge</strong> en Android o PC con
            Bluetooth activo, o el navegador <strong>Bluefy</strong> en dispositivos iOS.
          </div>
        </div>
      )}

      {/* 3. PANEL DE CONTROL & CONFIGURACIÓN */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-4 sm:p-5 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
          <div>
            <h2 className="text-xs font-mono font-bold tracking-widest uppercase text-zinc-400">
              Control de Conexión BLE
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Empareja directamente tu báscula Renpho para inspeccionar sus características GATT
            </p>
          </div>

          {/* Selector de Perfil para Handshake */}
          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-2xl p-1 self-start sm:self-auto">
            <span className="text-[10px] font-mono text-zinc-400 px-2 uppercase font-bold">
              Atleta:
            </span>
            <button
              type="button"
              onClick={() => handleAthleteChange("juan")}
              className={cn(
                "px-2.5 py-1 rounded-xl text-xs font-mono font-bold uppercase transition-all",
                selectedAthleteKey === "juan"
                  ? "bg-[#CCFF00] text-black shadow-sm"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              Juan (180 cm)
            </button>
            <button
              type="button"
              onClick={() => handleAthleteChange("wendy")}
              className={cn(
                "px-2.5 py-1 rounded-xl text-xs font-mono font-bold uppercase transition-all",
                selectedAthleteKey === "wendy"
                  ? "bg-[#F43F5E] text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              Wendy (155 cm)
            </button>
          </div>
        </div>

        {/* Botonera de Conexión */}
        <div className="flex flex-wrap items-center gap-2.5">
          {status === "disconnected" || status === "error" ? (
            <button
              type="button"
              onClick={handleScanDevice}
              className="flex-1 min-w-[200px] min-h-[48px] px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-black bg-[#CCFF00] flex items-center justify-center gap-2 shadow-xl shadow-[#CCFF00]/10 hover:brightness-105 active:scale-98 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>Escanear Báscula Renpho</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={disconnectDevice}
              className="flex-1 min-w-[160px] min-h-[48px] px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-zinc-200 bg-zinc-800 border border-zinc-700 flex items-center justify-center gap-2 hover:bg-zinc-700 active:scale-98 transition-all cursor-pointer"
            >
              <BluetoothConnected className="w-4 h-4 text-emerald-400" />
              <span>Desconectar Báscula</span>
            </button>
          )}

          {status !== "disconnected" && status !== "scanning" && (
            <button
              type="button"
              onClick={sendHandshakePacket}
              className="px-3.5 py-3 min-h-[48px] rounded-2xl font-mono font-bold text-xs uppercase tracking-wider text-cyan-300 bg-cyan-950/40 border border-cyan-800/60 hover:bg-cyan-900/50 flex items-center gap-1.5 transition-colors"
              title="Envía el paquete de datos del usuario (altura, sexo, edad) para activar el análisis de bioimpedancia"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Handshake Perfil</span>
            </button>
          )}

          {/* Checkbox Modo Escaneo Amplio */}
          <label className="flex items-center gap-2 px-3 py-2 bg-zinc-950/60 border border-zinc-800 rounded-2xl text-[11px] font-mono text-zinc-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={acceptAllDevices}
              onChange={(e) => setAcceptAllDevices(e.target.checked)}
              className="accent-[#CCFF00] rounded"
            />
            <span>Escanear todos los BLE (`acceptAllDevices`)</span>
          </label>
        </div>

        {/* Metadatos del dispositivo conectado */}
        {deviceInfo.name && (
          <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div>
              <span className="text-zinc-500 uppercase">Dispositivo:</span>{" "}
              <strong className="text-white">{deviceInfo.name}</strong>
            </div>
            {deviceInfo.services.length > 0 && (
              <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                <span className="text-zinc-500">Servicios:</span>
                {deviceInfo.services.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.5 rounded bg-zinc-900 text-cyan-400 border border-zinc-800"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. MÉTRICAS DECODIFICADAS (TARJETAS VISUALES) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#CCFF00]" />
            <h2 className="text-xs font-mono font-bold tracking-widest uppercase text-zinc-400">
              Telemetría Decodificada en Vivo
            </h2>
          </div>
          {latestBiometrics?.isStabilized && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-[#CCFF00] text-black animate-pulse">
              ✓ Medición Fijada
            </span>
          )}
        </div>

        {/* Grid de Métricas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* PESO TOTAL (Tarjeta Destacada) */}
          <div
            className={cn(
              "col-span-2 sm:col-span-1 rounded-3xl p-4 border transition-all duration-300",
              latestBiometrics?.isStabilized
                ? "bg-zinc-900 border-[#CCFF00]/50 shadow-xl shadow-[#CCFF00]/10"
                : "bg-zinc-900/60 border-zinc-800"
            )}
          >
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              Peso Total
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span
                className={cn(
                  "text-3xl sm:text-4xl font-black font-mono tracking-tight",
                  latestBiometrics?.weightKg ? "text-white" : "text-zinc-600"
                )}
              >
                {latestBiometrics?.weightKg !== null && latestBiometrics?.weightKg !== undefined
                  ? latestBiometrics.weightKg.toFixed(2)
                  : "--"}
              </span>
              <span className="text-xs font-mono font-bold text-[#CCFF00]">kg</span>
            </div>
            <p className="text-[10px] font-mono text-zinc-500 mt-1">
              {latestBiometrics?.isStabilized ? "Valor final fijado" : "En movimiento..."}
            </p>
          </div>

          {/* % GRASA CORPORAL */}
          <div className="rounded-3xl p-4 bg-zinc-900/60 border border-zinc-800">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              % Grasa Corporal
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span
                className={cn(
                  "text-2xl sm:text-3xl font-black font-mono tracking-tight",
                  latestBiometrics?.bodyFatPct ? "text-amber-400" : "text-zinc-600"
                )}
              >
                {latestBiometrics?.bodyFatPct !== null && latestBiometrics?.bodyFatPct !== undefined
                  ? latestBiometrics.bodyFatPct.toFixed(1)
                  : "--"}
              </span>
              <span className="text-xs font-mono font-bold text-amber-500">%</span>
            </div>
            <p className="text-[10px] font-mono text-zinc-500 mt-1">BIA Renpho</p>
          </div>

          {/* IMPEDANCIA ELÉCTRICA (OHMS) */}
          <div className="rounded-3xl p-4 bg-zinc-900/60 border border-zinc-800">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              Impedancia Cruda
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span
                className={cn(
                  "text-2xl sm:text-3xl font-black font-mono tracking-tight",
                  latestBiometrics?.impedance ? "text-cyan-400" : "text-zinc-600"
                )}
              >
                {latestBiometrics?.impedance ?? "--"}
              </span>
              <span className="text-xs font-mono font-bold text-cyan-500">Ω</span>
            </div>
            <p className="text-[10px] font-mono text-zinc-500 mt-1">Resistencia AC</p>
          </div>

          {/* MASA MUSCULAR */}
          <div className="rounded-3xl p-4 bg-zinc-900/60 border border-zinc-800">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              Masa Muscular
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span
                className={cn(
                  "text-2xl sm:text-3xl font-black font-mono tracking-tight",
                  latestBiometrics?.muscleMassKg ? "text-emerald-400" : "text-zinc-600"
                )}
              >
                {latestBiometrics?.muscleMassKg !== null && latestBiometrics?.muscleMassKg !== undefined
                  ? latestBiometrics.muscleMassKg.toFixed(1)
                  : "--"}
              </span>
              <span className="text-xs font-mono font-bold text-emerald-500">kg</span>
            </div>
            <p className="text-[10px] font-mono text-zinc-500 mt-1">Tejido Magro</p>
          </div>

          {/* % AGUA CORPORAL */}
          <div className="rounded-3xl p-4 bg-zinc-900/60 border border-zinc-800">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              % Agua Corporal
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span
                className={cn(
                  "text-xl sm:text-2xl font-black font-mono tracking-tight",
                  latestBiometrics?.waterPct ? "text-blue-400" : "text-zinc-600"
                )}
              >
                {latestBiometrics?.waterPct !== null && latestBiometrics?.waterPct !== undefined
                  ? latestBiometrics.waterPct.toFixed(1)
                  : "--"}
              </span>
              <span className="text-xs font-mono font-bold text-blue-500">%</span>
            </div>
            <p className="text-[10px] font-mono text-zinc-500 mt-1">Hidratación</p>
          </div>

          {/* MASA ÓSEA */}
          <div className="rounded-3xl p-4 bg-zinc-900/60 border border-zinc-800">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              Masa Ósea
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span
                className={cn(
                  "text-xl sm:text-2xl font-black font-mono tracking-tight",
                  latestBiometrics?.boneMassKg ? "text-violet-400" : "text-zinc-600"
                )}
              >
                {latestBiometrics?.boneMassKg !== null && latestBiometrics?.boneMassKg !== undefined
                  ? latestBiometrics.boneMassKg.toFixed(1)
                  : "--"}
              </span>
              <span className="text-xs font-mono font-bold text-violet-500">kg</span>
            </div>
            <p className="text-[10px] font-mono text-zinc-500 mt-1">Mineral óseo</p>
          </div>

          {/* GRASA VISCERAL */}
          <div className="rounded-3xl p-4 bg-zinc-900/60 border border-zinc-800">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              Grasa Visceral
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span
                className={cn(
                  "text-xl sm:text-2xl font-black font-mono tracking-tight",
                  latestBiometrics?.visceralFat ? "text-rose-400" : "text-zinc-600"
                )}
              >
                {latestBiometrics?.visceralFat ?? "--"}
              </span>
              <span className="text-[10px] font-mono font-bold text-rose-500">NIVEL</span>
            </div>
            <p className="text-[10px] font-mono text-zinc-500 mt-1">Índice 1-20</p>
          </div>

          {/* IMC / BMI */}
          <div className="rounded-3xl p-4 bg-zinc-900/60 border border-zinc-800">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              Índice IMC
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span
                className={cn(
                  "text-xl sm:text-2xl font-black font-mono tracking-tight",
                  latestBiometrics?.bmi ? "text-zinc-200" : "text-zinc-600"
                )}
              >
                {latestBiometrics?.bmi !== null && latestBiometrics?.bmi !== undefined
                  ? latestBiometrics.bmi.toFixed(1)
                  : "--"}
              </span>
            </div>
            <p className="text-[10px] font-mono text-zinc-500 mt-1">kg/m²</p>
          </div>
        </div>
      </div>

      {/* 5. CONSOLA DE TELEMETRÍA EN VIVO (RAW PAYLOAD Y LOGS) */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 sm:p-5 font-mono shadow-2xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Consola de Datos Crudos (Raw Byte Stream)</span>
          </div>
          <div className="flex items-center gap-2">
            {latestBiometrics?.rawHex && (
              <button
                type="button"
                onClick={handleCopyPayload}
                className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold flex items-center gap-1 transition-colors"
                title="Copiar último payload hexadecimal"
              >
                <Copy className="w-3 h-3" />
                <span>{copySuccess ? "¡Copiado!" : "Copiar Hex"}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setLogs([])}
              className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              title="Limpiar consola"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Visor de Último Payload Hexadecimal */}
        {latestBiometrics?.rawHex && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5 flex items-center justify-between">
              <span>Último Paquete Recibido ({latestBiometrics.rawBytes.length} Bytes)</span>
              <span>{latestBiometrics.receivedAt}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 font-bold text-xs">
              {latestBiometrics.rawBytes.map((byte, idx) => (
                <span
                  key={idx}
                  className={cn(
                    "px-1.5 py-0.5 rounded text-[11px] font-mono",
                    idx === 0 && "bg-cyan-950 text-cyan-300 border border-cyan-800",
                    (idx === 2 || idx === 3) && "bg-[#CCFF00]/20 text-[#CCFF00] border border-[#CCFF00]/40",
                    (idx === 4 || idx === 5) && "bg-amber-950 text-amber-300 border border-amber-800",
                    idx > 5 && "bg-zinc-900 text-zinc-300 border border-zinc-800"
                  )}
                  title={`Byte[${idx}]: Dec=${byte} Hex=0x${byte.toString(16).padStart(2, "0").toUpperCase()}`}
                >
                  {byte.toString(16).padStart(2, "0").toUpperCase()}
                </span>
              ))}
            </div>
            <div className="mt-2 text-[10px] text-zinc-400 flex flex-wrap gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> Header
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#CCFF00]" /> Peso
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Impedancia
              </span>
            </div>
          </div>
        )}

        {/* Terminal de Eventos en Tiempo Real */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-3 h-64 overflow-y-auto space-y-1.5 text-xs text-zinc-300">
          {logs.length === 0 ? (
            <p className="text-zinc-600 italic">Esperando eventos BLE...</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                <span className="text-zinc-500 text-[10px] shrink-0 mt-0.5 select-none">
                  [{log.timestamp}]
                </span>
                <span
                  className={cn(
                    "shrink-0 text-[10px] font-bold uppercase px-1 rounded select-none",
                    log.type === "info" && "text-zinc-400 bg-zinc-900",
                    log.type === "warn" && "text-amber-400 bg-amber-950/60",
                    log.type === "error" && "text-rose-400 bg-rose-950/60",
                    log.type === "data" && "text-[#CCFF00] bg-[#CCFF00]/10",
                    log.type === "handshake" && "text-cyan-400 bg-cyan-950/60"
                  )}
                >
                  {log.type}
                </span>
                <span className="break-all">
                  {log.message}
                  {log.hex && (
                    <span className="block text-[11px] text-zinc-400 bg-zinc-900/60 px-2 py-0.5 mt-0.5 rounded border border-zinc-800/60">
                      HEX: {log.hex}
                    </span>
                  )}
                </span>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}
