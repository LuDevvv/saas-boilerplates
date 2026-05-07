export interface User {
  id: string;
  email: string;
  name?: string | null;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  avatar?: string;
  avatarUrl?: string | null;
  role?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  companies?: Company[];
  subscriptions?: Subscription[];
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  branches?: Branch[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Company extends Omit<Workspace, 'slug'> {
  logo?: string;
}

export interface Branch {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  website?: string;
  domain?: string;
  currency?: string;
  currencyId?: string;
  openingHours?: Record<string, { open: string; close: string; closed?: boolean }>;
  deliveryCost?: number;
  minimumOrder?: number;
  logo?: string;
  banner?: string;
  isActive: boolean;
  isDeleted: boolean;
  shoppingCart?: boolean;
  hasDeliveries?: boolean;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  tiktok?: string;
  googleMaps?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  branchId: string;
  categoryId: string;
  name: string;
  title?: string;
  description?: string;
  price: number;
  image?: string;
  images?: Array<{ url: string; order?: number }>;
  isAvailable: boolean;
  position: number;
  preparationTime?: number;
  calories?: number;
  allergens?: string[];
  tags?: string[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  branchId: string;
  name: string;
  description?: string;
  image?: string;
  position: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FoodVariant {
  id: string;
  productId: string;
  name: string;
  price: number;
  image?: string;
  isAvailable: boolean;
  position: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Extra {
  id: string;
  companyId: string;
  categoryId?: string;
  name: string;
  description?: string;
  price: number;
  isAvailable: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MealTime {
  id: string;
  companyId: string;
  branchId?: string;
  name: string;
  startTime: string;
  endTime: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UnitsOfMeasurement {
  id: string;
  companyId?: string;
  name: string;
  abbreviation: string;
  type?: "weight" | "volume" | "quantity";
  unit?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Currency {
  id: string;
  code: string;
  currency?: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  isDefault: boolean;
  isActive: boolean;
}

export interface Qr {
  id: string;
  branchId: string;
  name: string;
  design?: Record<string, unknown>;
  type: 'menu' | 'payment' | 'landing';
  shortCode?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Advertisement {
  id: string;
  branchId?: string;
  companyId: string;
  title: string;
  description?: string;
  image?: string;
  media?: { url: string; type: string }[];
  link?: string;
  isActive: boolean;
  position: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  TRIALING = 'trialing',
  PAUSED = 'paused',
}

export enum PaymentMethodType {
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
}

export interface Subscription {
  id: string;
  workspaceId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  trialStart?: string;
  trialEnd?: string;
}

export interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number;
  amount?: number;
  currency?: string;
  interval: 'month' | 'year';
  features: string[];
  isActive: boolean;
  stripePriceId?: string;
  trialDays?: number;
  plans?: Plan[];
}

export interface PaymentMethod {
  id: string;
  userId: string;
  stripePaymentMethodId: string;
  type: PaymentMethodType;
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface Media {
  id: string;
  url: string;
  type: 'image' | 'video' | 'document';
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TopProduct {
  productId: string;
  name: string;
  image?: string;
  count: string | number;
  totalSold: number;
  revenue: number;
}