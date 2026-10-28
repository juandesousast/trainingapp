export interface HealthStatus {
  label: string;
  category: "optimal" | "normal" | "warning" | "alert";
  bgClass: string;
  textClass: string;
  borderClass: string;
}

/**
 * Indicadores clínicos de IMC
 * Bajo peso (<18.5), Normal (18.5-24.9), Sobrepeso (25-29.9), Obesidad (30+)
 */
export function getBMIBadge(bmi: number): HealthStatus {
  if (bmi < 18.5) {
    return {
      label: "Bajo peso",
      category: "warning",
      bgClass: "bg-sky-500/15",
      textClass: "text-sky-400",
      borderClass: "border-sky-500/30",
    };
  }
  if (bmi <= 24.9) {
    return {
      label: "Normal",
      category: "optimal",
      bgClass: "bg-emerald-500/15",
      textClass: "text-emerald-400",
      borderClass: "border-emerald-500/30",
    };
  }
  if (bmi <= 29.9) {
    return {
      label: "Sobrepeso",
      category: "warning",
      bgClass: "bg-amber-500/15",
      textClass: "text-amber-400",
      borderClass: "border-amber-500/30",
    };
  }
  return {
    label: "Obesidad",
    category: "alert",
    bgClass: "bg-rose-500/15",
    textClass: "text-rose-400",
    borderClass: "border-rose-500/30",
  };
}

/**
 * Indicadores clínicos de Grasa Visceral
 * Saludable (1-9), Alta (10-14), Muy alta (15+)
 */
export function getVisceralFatBadge(rating: number): HealthStatus {
  if (rating <= 9) {
    return {
      label: "Saludable",
      category: "optimal",
      bgClass: "bg-emerald-500/15",
      textClass: "text-emerald-400",
      borderClass: "border-emerald-500/30",
    };
  }
  if (rating <= 14) {
    return {
      label: "Alta",
      category: "warning",
      bgClass: "bg-amber-500/15",
      textClass: "text-amber-400",
      borderClass: "border-amber-500/30",
    };
  }
  return {
    label: "Muy alta",
    category: "alert",
    bgClass: "bg-rose-500/15",
    textClass: "text-rose-400",
    borderClass: "border-rose-500/30",
  };
}

/**
 * Indicadores clínicos de % Grasa Corporal según Sexo
 * Hombres: Esencial (2-5%), Atlético (6-13%), Fitness (14-17%), Aceptable (18-24%), Alto (25%+)
 * Mujeres: Esencial (10-13%), Atlético (14-20%), Fitness (21-24%), Aceptable (25-31%), Alto (32%+)
 */
export function getBodyFatBadge(fatPct: number, gender: "male" | "female" = "male"): HealthStatus {
  if (gender === "male") {
    if (fatPct < 6) {
      return {
        label: "Esencial",
        category: "warning",
        bgClass: "bg-sky-500/15",
        textClass: "text-sky-400",
        borderClass: "border-sky-500/30",
      };
    }
    if (fatPct <= 13) {
      return {
        label: "Atlético",
        category: "optimal",
        bgClass: "bg-emerald-500/15",
        textClass: "text-emerald-400",
        borderClass: "border-emerald-500/30",
      };
    }
    if (fatPct <= 17) {
      return {
        label: "Fitness",
        category: "optimal",
        bgClass: "bg-[#CCFF00]/15",
        textClass: "text-[#CCFF00]",
        borderClass: "border-[#CCFF00]/30",
      };
    }
    if (fatPct <= 24.9) {
      return {
        label: "Aceptable",
        category: "warning",
        bgClass: "bg-amber-500/15",
        textClass: "text-amber-400",
        borderClass: "border-amber-500/30",
      };
    }
    return {
      label: "Alto",
      category: "alert",
      bgClass: "bg-rose-500/15",
      textClass: "text-rose-400",
      borderClass: "border-rose-500/30",
    };
  } else {
    // Mujeres
    if (fatPct < 14) {
      return {
        label: "Esencial",
        category: "warning",
        bgClass: "bg-sky-500/15",
        textClass: "text-sky-400",
        borderClass: "border-sky-500/30",
      };
    }
    if (fatPct <= 20) {
      return {
        label: "Atlético",
        category: "optimal",
        bgClass: "bg-emerald-500/15",
        textClass: "text-emerald-400",
        borderClass: "border-emerald-500/30",
      };
    }
    if (fatPct <= 24) {
      return {
        label: "Fitness",
        category: "optimal",
        bgClass: "bg-[#F43F5E]/15",
        textClass: "text-[#F43F5E]",
        borderClass: "border-[#F43F5E]/30",
      };
    }
    if (fatPct <= 31.9) {
      return {
        label: "Aceptable",
        category: "warning",
        bgClass: "bg-amber-500/15",
        textClass: "text-amber-400",
        borderClass: "border-amber-500/30",
      };
    }
    return {
      label: "Alto",
      category: "alert",
      bgClass: "bg-rose-500/15",
      textClass: "text-rose-400",
      borderClass: "border-rose-500/30",
    };
  }
}
