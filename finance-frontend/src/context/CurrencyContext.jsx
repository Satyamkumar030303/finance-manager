import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext";

export const CurrencyContext = createContext();

const STATIC_RATES_FROM_INR = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  JPY: 1.77,
  AED: 0.044,
  SAR: 0.045,
  SGD: 0.016,
  AUD: 0.018,
  CAD: 0.016,
};

export const CURRENCY_SYMBOLS = {
  INR: "₹", USD: "$", EUR: "€", GBP: "£", JPY: "¥",
  AED: "د.إ", SAR: "﷼", SGD: "S$", AUD: "A$", CAD: "C$",
};

// Appropriate display locale per currency
const CURRENCY_LOCALE = {
  INR: "en-IN", USD: "en-US", EUR: "de-DE", GBP: "en-GB",
  JPY: "ja-JP", AED: "ar-AE", SAR: "ar-SA", SGD: "en-SG",
  AUD: "en-AU", CAD: "en-CA",
};

export const CurrencyProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [currency, setCurrency] = useState("INR");
  const [rates, setRates] = useState(STATIC_RATES_FROM_INR);

  useEffect(() => {
    if (user?.preferredCurrency) setCurrency(user.preferredCurrency);
  }, [user?.preferredCurrency]);

  // Convert amount from INR to target currency
  const convert = useCallback(
    (amountInINR, targetCurrency = currency) => amountInINR * (rates[targetCurrency] || 1),
    [currency, rates]
  );

  // Full formatted currency string (e.g. "₹1,23,456.00" or "$1,481.37")
  const format = useCallback(
    (amountInINR, targetCurrency = currency) => {
      const converted = convert(amountInINR, targetCurrency);
      const locale = CURRENCY_LOCALE[targetCurrency] || "en-US";
      try {
        return new Intl.NumberFormat(locale, {
          style: "currency",
          currency: targetCurrency,
          maximumFractionDigits: targetCurrency === "JPY" ? 0 : 2,
        }).format(converted);
      } catch {
        return `${CURRENCY_SYMBOLS[targetCurrency] || targetCurrency}${converted.toFixed(2)}`;
      }
    },
    [convert, currency]
  );

  // Compact format for chart axis ticks: "$5k", "₹5k"
  const compact = useCallback(
    (amountInINR, targetCurrency = currency) => {
      const converted = convert(amountInINR, targetCurrency);
      const sym = CURRENCY_SYMBOLS[targetCurrency] || targetCurrency;
      const abs = Math.abs(converted);
      if (abs >= 1_000_000) return `${sym}${(converted / 1_000_000).toFixed(1)}M`;
      if (abs >= 1_000)     return `${sym}${(converted / 1_000).toFixed(0)}k`;
      return `${sym}${converted.toFixed(0)}`;
    },
    [convert, currency]
  );

  // Shorthand: format with current currency
  const fmt = useCallback((amountInINR) => format(amountInINR), [format]);

  const symbol = CURRENCY_SYMBOLS[currency] || currency;

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert, format, fmt, compact, symbol, rates }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
