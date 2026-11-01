/**
 * VECTOR OS - Laboratorio de Diagnóstico Web Bluetooth para Básculas Renpho
 * Servicio para escaneo, conexión, handshake y decodificación de telemetría BLE en vivo.
 *
 * MODO SEGURO: Esta utilidad opera en modo de solo lectura / diagnóstico y NO persiste
 * ningún dato en la base de datos (biometric_logs).
 */

export type BLEConnectionStatus =
  | "disconnected"
  | "scanning"
  | "connecting"
  | "connected"
  | "receiving"
  | "error";

export interface RenphoAthleteProfile {
  name: string;
  sex: "male" | "female";
  heightCm: number;
  age: number;
}

export const PRESET_ATHLETES: Record<string, RenphoAthleteProfile> = {
  juan: {
    name: "Juan",
    sex: "male",
    heightCm: 180,
    age: 32,
  },
  wendy: {
    name: "Wendy",
    sex: "female",
    heightCm: 155,
    age: 30,
  },
};

export interface DecodedBiometrics {
  weightKg: number | null;
  isStabilized: boolean;
  impedance: number | null; // Ohmios (Ω)
  bodyFatPct: number | null; // % Grasa
  muscleMassKg: number | null; // kg Masa Muscular
  waterPct: number | null; // % Agua
  boneMassKg: number | null; // kg Masa Ósea
  visceralFat: number | null; // Nivel 1-20
  bmi: number | null;
  rawHex: string;
  rawBytes: number[];
  receivedAt: string;
}

export interface TelemetryLog {
  id: string;
  timestamp: string;
  type: "info" | "warn" | "error" | "data" | "handshake";
  message: string;
  hex?: string;
}

// UUIDs comunes en básculas Renpho, Yolanda, Chipsea y Bluetooth SIG
export const RENPHO_SERVICES = [
  0xffe0,
  0xfff0,
  0x181d, // weight_scale
  0x181b, // body_composition
  0xfa00,
  "0000ffe0-0000-1000-8000-00805f9b34fb",
  "0000fff0-0000-1000-8000-00805f9b34fb",
  "0000181d-0000-1000-8000-00805f9b34fb",
  "0000181b-0000-1000-8000-00805f9b34fb",
  "0000fa00-0000-1000-8000-00805f9b34fb",
];

export const RENPHO_CHARACTERISTICS = [
  0xffe1,
  0xfff1,
  0xfff2,
  0x2a9d, // weight_measurement
  0x2a9c, // body_composition_measurement
  0xfa01,
  0xfa02,
  "0000ffe1-0000-1000-8000-00805f9b34fb",
  "0000fff1-0000-1000-8000-00805f9b34fb",
  "0000fff2-0000-1000-8000-00805f9b34fb",
  "00002a9d-0000-1000-8000-00805f9b34fb",
  "00002a9c-0000-1000-8000-00805f9b34fb",
];

/**
 * Decodificador de telemetría Renpho / Yolanda / Chipsea / BLE SIG
 */
export function decodeRenphoPacket(
  bytes: number[],
  profile: RenphoAthleteProfile
): DecodedBiometrics {
  const hex = bytes.map((b) => b.toString(16).padStart(2, "0").toUpperCase()).join(" ");
  const receivedAt = new Date().toLocaleTimeString("es-ES", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  let weightKg: number | null = null;
  let isStabilized = false;
  let impedance: number | null = null;
  let directFat: number | null = null;

  // 1. PROTOCOLO RENPHO / CHIPSEA (Header 0xCF o 0x10)
  if (bytes[0] === 0xcf || bytes[0] === 0x10) {
    const statusByte = bytes[1];
    isStabilized = (statusByte & 0x01) === 0x01 || statusByte === 0x02 || statusByte === 0x03;

    // Peso en bytes 2-3 o 3-4 según variante
    if (bytes[0] === 0xcf && bytes.length >= 6) {
      const rawWeight = (bytes[2] << 8) | bytes[3];
      weightKg = rawWeight > 0 ? Number((rawWeight / 100).toFixed(2)) : null;

      // Impedancia en bytes 4-5
      const rawImp = (bytes[4] << 8) | bytes[5];
      if (rawImp >= 250 && rawImp <= 1500) {
        impedance = rawImp;
      }
    } else if (bytes[0] === 0x10 && bytes.length >= 7) {
      const rawWeight = (bytes[3] << 8) | bytes[4];
      weightKg = rawWeight > 0 ? Number((rawWeight / 100).toFixed(2)) : null;

      const rawImp = (bytes[5] << 8) | bytes[6];
      if (rawImp >= 250 && rawImp <= 1500) {
        impedance = rawImp;
      }
    }
  }

  // 2. PROTOCOLO YOLANDA / QNSCALE (Header 0x02 o 0xFE)
  else if (bytes[0] === 0x02 || bytes[0] === 0xfe) {
    const statusByte = bytes[1];
    isStabilized = statusByte === 0x02 || statusByte === 0x03;

    if (bytes.length >= 6) {
      const rawWeight = (bytes[2] << 8) | bytes[3];
      weightKg = rawWeight > 0 ? Number((rawWeight / 100).toFixed(2)) : null;

      const rawImp = (bytes[4] << 8) | bytes[5];
      if (rawImp >= 250 && rawImp <= 1500) {
        impedance = rawImp;
      }

      if (bytes.length >= 8) {
        const rawFat = (bytes[6] << 8) | bytes[7];
        if (rawFat > 30 && rawFat < 600) {
          directFat = Number((rawFat / 10).toFixed(1));
        }
      }
    }
  }

  // 3. PROTOCOLO BLUETOOTH SIG STANDARD (Weight Scale Service 0x2A9D)
  else if (bytes.length >= 3 && (bytes[0] === 0x00 || bytes[0] === 0x02)) {
    // Little-endian
    const rawWeight = bytes[1] | (bytes[2] << 8);
    // Resolución estándar 0.005 kg o 0.01 kg
    weightKg = rawWeight > 0 ? Number((rawWeight * 0.005).toFixed(2)) : null;
    isStabilized = true;
  }

  // 4. DECODIFICADOR HEURÍSTICO DE RESPALDO (Escaneo de palabras de 16 bits)
  if (weightKg === null || weightKg < 20 || weightKg > 260) {
    for (let i = 0; i < bytes.length - 1; i++) {
      // Probar big-endian
      const be = (bytes[i] << 8) | bytes[i + 1];
      const kgCandidateBe = be / 100;
      if (kgCandidateBe >= 35 && kgCandidateBe <= 220) {
        weightKg = Number(kgCandidateBe.toFixed(2));
        if (i + 3 < bytes.length) {
          const impCandidate = (bytes[i + 2] << 8) | bytes[i + 3];
          if (impCandidate >= 300 && impCandidate <= 1200) {
            impedance = impCandidate;
          }
        }
        break;
      }
    }
  }

  // CÁLCULO DE COMPOSICIÓN CORPORAL (BIA Fórmulas Deportivas Renpho)
  let bmi: number | null = null;
  let bodyFatPct: number | null = directFat;
  let muscleMassKg: number | null = null;
  let waterPct: number | null = null;
  let boneMassKg: number | null = null;
  let visceralFat: number | null = null;

  if (weightKg !== null && weightKg > 0) {
    const heightM = profile.heightCm / 100;
    bmi = Number((weightKg / (heightM * heightM)).toFixed(1));
    const isMale = profile.sex === "male" ? 1 : 0;
    const age = profile.age;

    // Si la báscula no dio grasa precalculada pero sí impedancia
    if (bodyFatPct === null && impedance !== null && impedance > 200) {
      // Fórmula FFM de impedancia bioeléctrica deportiva
      const h2_z = (profile.heightCm * profile.heightCm) / impedance;
      const ffm = -4.104 + 0.518 * h2_z + 0.231 * weightKg + 4.229 * isMale;
      const calculatedFat = ((weightKg - ffm) / weightKg) * 100;
      bodyFatPct = Number(Math.max(5.0, Math.min(50.0, calculatedFat)).toFixed(1));
    } else if (bodyFatPct === null) {
      // Estimación basada en BMI y sexo si no hay impedancia
      const estimatedFat = 1.2 * bmi + 0.23 * age - 10.8 * isMale - 5.4;
      bodyFatPct = Number(Math.max(6.0, Math.min(45.0, estimatedFat)).toFixed(1));
    }

    if (bodyFatPct !== null) {
      const fatKg = weightKg * (bodyFatPct / 100);
      const ffmKg = weightKg - fatKg;

      // Masa muscular esquelética (~73% del FFM)
      muscleMassKg = Number((ffmKg * 0.73).toFixed(1));

      // % de agua corporal (~73.2% del tejido magro)
      waterPct = Number(((ffmKg * 0.732) / weightKg * 100).toFixed(1));

      // Masa ósea (~5.8% del tejido magro)
      boneMassKg = Number((ffmKg * 0.058).toFixed(1));

      // Grasa visceral (escala clínica 1 a 20)
      const visc = Math.round(bmi * 0.38 + age * 0.08 - isMale * 1.8 - 3.2);
      visceralFat = Math.max(1, Math.min(20, visc));
    }
  }

  return {
    weightKg,
    isStabilized,
    impedance,
    bodyFatPct,
    muscleMassKg,
    waterPct,
    boneMassKg,
    visceralFat,
    bmi,
    rawHex: hex,
    rawBytes: bytes,
    receivedAt,
  };
}

/**
 * Genera el paquete de Handshake de Perfil para activar BIA en básculas Renpho
 */
export function buildRenphoProfileHandshake(profile: RenphoAthleteProfile): Uint8Array {
  const isMale = profile.sex === "male" ? 1 : 2;
  const height = Math.round(profile.heightCm);
  const age = Math.round(profile.age);

  // Formato de paquete de usuario Renpho / Chipsea (16 bytes)
  // [0x10, 0x01, isMale, age, height, 0x01 (kg), ...]
  const packet = new Uint8Array(16);
  packet[0] = 0x10;
  packet[1] = 0x01; // ID usuario
  packet[2] = isMale;
  packet[3] = age;
  packet[4] = height;
  packet[5] = 0x01; // Unidad KG

  // Checksum XOR en el último byte
  let checksum = 0;
  for (let i = 0; i < 15; i++) {
    checksum ^= packet[i];
  }
  packet[15] = checksum;

  return packet;
}

/**
 * Comprueba si la API Web Bluetooth está disponible en el entorno cliente actual
 */
export function isWebBluetoothSupported(): boolean {
  if (typeof window === "undefined") return false;
  return typeof navigator !== "undefined" && "bluetooth" in navigator;
}
