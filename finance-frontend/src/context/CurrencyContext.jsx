import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext";

export const CurrencyContext = createContext();

// Static approximate rates relative to INR (updated manually or via API)
// These serve as a fallback when no exchange rate API key is configured
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

const CURRENCY_SYMBOLS = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  AED: "د.إ",
  SAR: "﷼",
  SGD: "S$",
  AUD: "A$",
  CAD: "C$",
};

export const CurrencyProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [currency, setCurrency] = useState("INR");
  const [rates, setRates] = useState(STATIC_RATES_FROM_INR);

  // Sync with user's preferred currency
  useEffect(() => {
    if (user?.preferredCurrency) {
      setCurrency(user.preferredCurrency);
    }
  }, [user?.preferredCurrency]);

  // Convert amount from INR to target currency
  const convert = useCallback(
    (amountInINR, targetCurrency = currency) => {
      const rate = rates[targetCurrency] || 1;
      return amountInINR * rate;
    },
    [currency, rates]
  );

  // Format a number as currency string
  const format = useCallback(
    (amountInINR, targetCurrency = currency) => {
      const converted = convert(amountInINR, targetCurrency);
      const symbol = CURRENCY_SYMBOLS[targetCurrency] || targetCurrency;
      try {
        return new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: targetCurrency,
          maximumFractionDigits: 2,
        }).format(converted);
      } catch {
        return `${symbol}${converted.toFixed(2)}`;
      }
    },
    [convert, currency]
  );

  const symbol = CURRENCY_SYMBOLS[currency] || currency;

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert, format, symbol, rates }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
