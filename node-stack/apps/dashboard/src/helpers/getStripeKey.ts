import { loadStripe, Stripe } from "@stripe/stripe-js";

// Use a singleton pattern to ensure Stripe is loaded only once
let stripePromise: Promise<Stripe | null> | null = null;

export const getStripeKey = () => {
  const isDevelopment = import.meta.env["VITE_STAGE"] === "dev";
  return isDevelopment
    ? import.meta.env["VITE_STRIPE_PUBLISHABLE_KEY_TEST"] || ""
    : import.meta.env["VITE_STRIPE_PUBLISHABLE_KEY"] || "";
};

export const loadStripeInstance = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(getStripeKey());
  }
  return stripePromise;
};
