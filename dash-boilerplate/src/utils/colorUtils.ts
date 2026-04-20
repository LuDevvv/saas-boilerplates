/**
 * Calcula el brillo de un color hexadecimal usando la fórmula de luminancia percibida
 * @param hex Color en formato hexadecimal (#RRGGBB o RRGGBB)
 * @returns Valor de brillo entre 0-255
 */
export function getBrightness(hex: string): number {
  // Remover # si está presente
  hex = hex.replace(/^#/, "");

  // Validar formato
  if (hex.length !== 6) {
    console.warn(`Invalid hex color: ${hex}`);
    return 128; // Valor por defecto
  }

  // Parsear valores RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Verificar valores válidos
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    console.warn(`Invalid hex color values: ${hex}`);
    return 128;
  }

  // Calcular brillo usando fórmula de luminancia percibida
  // https://www.w3.org/TR/AERT/#color-contrast
  return (r * 299 + g * 587 + b * 114) / 1000;
}

/**
 * Ajusta el brillo de un color hexadecimal
 * @param hex Color en formato hexadecimal (#RRGGBB o RRGGBB)
 * @param amount Cantidad a ajustar (-255 a 255). Positivo para aclarar, negativo para oscurecer
 * @returns Color ajustado en formato #RRGGBB
 */
export function adjustColor(hex: string, amount: number): string {
  // Remover # si está presente
  hex = hex.replace(/^#/, "");

  // Validar formato
  if (hex.length !== 6) {
    console.warn(`Invalid hex color: ${hex}`);
    return "#000000";
  }

  // Parsear valores RGB
  let r = parseInt(hex.substr(0, 2), 16);
  let g = parseInt(hex.substr(2, 2), 16);
  let b = parseInt(hex.substr(4, 2), 16);

  // Verificar valores válidos
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    console.warn(`Invalid hex color values: ${hex}`);
    return "#000000";
  }

  // Ajustar valores manteniendo el rango 0-255
  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));

  // Convertir de vuelta a hexadecimal con padding
  const rHex = r.toString(16).padStart(2, "0");
  const gHex = g.toString(16).padStart(2, "0");
  const bHex = b.toString(16).padStart(2, "0");

  return `#${rHex}${gHex}${bHex}`;
}

/**
 * Determina si un color de fondo requiere texto claro u oscuro
 * @param bgColor Color de fondo en formato hexadecimal
 * @returns Color de texto recomendado (#000000 o #FFFFFF)
 */
export function getContrastTextColor(bgColor: string): string {
  const brightness = getBrightness(bgColor);
  return brightness > 128 ? "#000000" : "#FFFFFF";
}

/**
 * Convierte un color hexadecimal a RGB
 * @param hex Color en formato hexadecimal
 * @returns Objeto con valores r, g, b (0-255)
 */
export function hexToRgb(
  hex: string
): { r: number; g: number; b: number } | null {
  hex = hex.replace(/^#/, "");

  if (hex.length !== 6) {
    return null;
  }

  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return null;
  }

  return { r, g, b };
}

/**
 * Convierte RGB a hexadecimal
 * @param r Rojo (0-255)
 * @param g Verde (0-255)
 * @param b Azul (0-255)
 * @returns Color en formato #RRGGBB
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));

  const rHex = clamp(r).toString(16).padStart(2, "0");
  const gHex = clamp(g).toString(16).padStart(2, "0");
  const bHex = clamp(b).toString(16).padStart(2, "0");

  return `#${rHex}${gHex}${bHex}`;
}
