import { z } from "zod";

// Regex combinada para validar tanto el formato 24h (HH:MM) como el formato 12h (HH:MM AM/PM)
const timeFormatRegex =
  /^(([0-1]?[0-9]|2[0-3]):[0-5][0-9])|((0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM|am|pm))$/;

// Función para convertir cualquier formato de hora a formato 24h
const normalizeTo24Hour = (time: string): string => {
  // Si ya está en formato 24h (sin AM/PM), devolverlo
  if (!/am|pm/i.test(time)) {
    return time;
  }

  // Extraer horas, minutos y período
  const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)/i);
  if (!match || match.length < 4) return time; // Devolver original si no coincide con el patrón

  const hoursStr = match[1];
  const minutesStr = match[2];
  const periodStr = match[3];

  if (!hoursStr || !minutesStr || !periodStr) return time;

  let hours24 = parseInt(hoursStr, 10);
  if (isNaN(hours24)) return time;

  // Convertir al formato de 24 horas
  if (periodStr.toUpperCase() === "PM" && hours24 < 12) {
    hours24 += 12;
  } else if (periodStr.toUpperCase() === "AM" && hours24 === 12) {
    hours24 = 0;
  }

  return `${String(hours24).padStart(2, "0")}:${minutesStr}`;
};

// Base del esquema con pre-procesamiento para normalizar entradas de hora
const baseMealTimeSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  startTime: z
    .string()
    .regex(timeFormatRegex, "Formato de hora inválido. Use HH:MM o HH:MM AM/PM")
    .transform(normalizeTo24Hour), // Convertir a formato 24h antes de guardar
  endTime: z
    .string()
    .regex(timeFormatRegex, "Formato de hora inválido. Use HH:MM o HH:MM AM/PM")
    .transform(normalizeTo24Hour), // Convertir a formato 24h antes de guardar
  companyId: z.string().optional().nullable(),
  branchId: z.string().optional().nullable(),
});

// Esquema completo
export const mealTimeSchema = baseMealTimeSchema;

// Esquema para actualizar (todos los campos opcionales)
export const updateMealTimeSchema = baseMealTimeSchema.partial();
