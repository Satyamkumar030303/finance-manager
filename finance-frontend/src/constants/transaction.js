// Single source of truth for transaction-related enums.
// Values are stored on the wire / in the DB as English; display labels go through t().

export const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Utilities",
  "Health",
  "Education",
  "Finance",
  "Telecom",
  "Travel",
  "Salary",
  "Business",
  "Investment",
  "Bills",
  "Miscellaneous",
];

export const FREQUENCIES = ["daily", "weekly", "monthly", "yearly"];

export const TRANSACTION_TYPES = ["income", "expense"];

// Translation helpers. Pass the t function from useTranslation.
export const tCategory = (t, value) =>
  t(`categories.${String(value || "").toLowerCase()}`, value || "");

export const tFrequency = (t, value) =>
  t(`frequencies.${String(value || "").toLowerCase()}`, value || "");

export const tType = (t, value) => t(`transactions.${value}`, value || "");

// Month abbreviations keyed by 1-based index (e.g. month=5 → "May").
export const tMonthAbbr = (t, month) => {
  const keys = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const k = keys[Number(month) - 1];
  return k ? t(`months.${k}`) : "";
};
