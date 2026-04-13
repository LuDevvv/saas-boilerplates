// Core interfaces — always safe to import
export * from "./interfaces/payment-provider.interface";

// Mock provider — no external SDK dependency
export * from "./providers/mock.provider";

// Package-level billing service
export * from "./billing.service";

// SDK-dependent providers are excluded to avoid dependency bloat.
// Polar is fetch-based and can be imported directly if needed:
// import { PolarProvider } from "@node-stack/billing-adapter/dist/providers/polar.provider.js";
export { PolarProvider } from "./providers/polar.provider";
