import type { LucideIcon } from "lucide-react";

export interface Kpi {
  label: string;
  value: string;
  trend: string;
  isPositive: boolean;
  icon: LucideIcon;
  tooltip: string;
}

export interface SalesData {
  date: string;
  current: number;
  last: number;
}

export interface ActivityData {
  day: string;
  value: number;
}

export interface Product {
  id: string;
  name: string;
  sold: string;
  revenue: string;
  rating: string;
  image: string;
}

export type TimeFilter = "day" | "week" | "month";