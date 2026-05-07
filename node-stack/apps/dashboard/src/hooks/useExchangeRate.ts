import { useState, useEffect } from "react";

interface ExchangeRateResult {
  rate: number | null;
  isLoading: boolean;
  /** Format a USD amount as Dominican Pesos: "RD$ 1,740" */
  toDOP: (usd: number) => string | null;
}

/**
 * Fetches the live USD → DOP exchange rate from open.er-api.com (free, no API key).
 * Silently swallows network errors — callers should handle null rate gracefully.
 */
export function useExchangeRate(): ExchangeRateResult {
  const [rate, setRate]         = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("https://open.er-api.com/v6/latest/USD")
      .then(r => r.json())
      .then(data => {
        if (!cancelled && data?.result === "success" && data.rates?.DOP) {
          setRate(data.rates.DOP as number);
        }
      })
      .catch(() => {}) // Non-critical — silently fail
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const toDOP = (usd: number): string | null => {
    if (!rate || usd <= 0) return null;
    const amount = Math.round(usd * rate);
    return `RD$ ${amount.toLocaleString("en-US")}`;
  };

  return { rate, isLoading, toDOP };
}
