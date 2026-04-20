// Utility functions for time format conversion
export const to12HourFormat = (time24: string): string => {
  if (!time24 || !time24.includes(":")) return time24;

  const parts = time24.split(":");
  if (parts.length < 2) return time24;

  const hoursStr = parts[0];
  const minutesStr = parts[1];

  if (!hoursStr || !minutesStr) return time24;

  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (isNaN(hours) || isNaN(minutes)) return time24;

  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12; // Convert 0 to 12 for midnight

  return `${String(hours12).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )} ${period}`;
};

export const to24HourFormat = (time12: string): string => {
  if (!time12) return "";

  // If already in 24h format, return as is
  if (
    !time12.includes("AM") &&
    !time12.includes("PM") &&
    time12.includes(":")
  ) {
    return time12;
  }

  // Extract hours, minutes, and period
  const match = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)/i);
  if (!match || match.length < 4) return time12; // Return original if not matching pattern

  const hoursStr = match[1];
  const minutesStr = match[2];
  const periodStr = match[3];

  if (!hoursStr || !minutesStr || !periodStr) return time12;

  let hours24 = parseInt(hoursStr, 10);
  if (isNaN(hours24)) return time12;

  // Convert to 24-hour format
  if (periodStr.toUpperCase() === "PM" && hours24 < 12) {
    hours24 += 12;
  } else if (periodStr.toUpperCase() === "AM" && hours24 === 12) {
    hours24 = 0;
  }

  return `${String(hours24).padStart(2, "0")}:${minutesStr}`;
};
