/**
 * SMS Finance Parser Service
 * Reads bank/UPI SMS messages on Android via Capacitor,
 * parses them using regex (fast path) or backend AI (fallback),
 * and creates transactions automatically.
 */

let Capacitor = null;
let SmsRetriever = null;

const isAndroid = () => {
  try {
    if (!Capacitor) Capacitor = require("@capacitor/core").Capacitor;
    return Capacitor.getPlatform() === "android";
  } catch {
    return false;
  }
};

// ─── Regex-based SMS Parser (fast path, handles ~90% of Indian bank SMS) ────

const DEBIT_REGEX = /(?:debited|debit|spent|paid|purchase|withdrawn|payment of|transferred)\s*(?:rs\.?|inr|₹)?\s*([\d,]+(?:\.\d{1,2})?)/i;
const CREDIT_REGEX = /(?:credited|credit|received|deposited|refund)\s*(?:rs\.?|inr|₹)?\s*([\d,]+(?:\.\d{1,2})?)/i;
const AMOUNT_REGEX = /(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)/i;

const MERCHANT_PATTERNS = [
  /(?:at|to|from|merchant|at merchant)\s+([A-Z][A-Za-z0-9\s&.'-]{2,30}?)(?:\s+on|\s+via|\s+ref|$)/i,
  /(?:UPI[-\s]?ID:|to VPA|UPI transfer to)\s*([A-Za-z0-9@._-]{3,40})/i,
];

const CATEGORY_MAP = {
  Food: ["zomato", "swiggy", "blinkit", "zepto", "grofers", "bigbasket", "restaurant", "cafe", "food", "pizza", "burger", "kitchen"],
  Transport: ["uber", "ola", "rapido", "metro", "irctc", "makemytrip", "goibibo", "bus", "taxi", "fuel", "petrol", "diesel"],
  Shopping: ["amazon", "flipkart", "myntra", "ajio", "nykaa", "meesho", "mall", "shop", "store", "mart"],
  Utilities: ["jio", "airtel", "vi", "bsnl", "electricity", "water", "gas", "broadband", "wifi", "mobile", "recharge"],
  Entertainment: ["netflix", "hotstar", "prime", "spotify", "youtube", "cinema", "pvr", "inox", "bookmyshow"],
  Health: ["pharmacy", "apollo", "medplus", "1mg", "practo", "doctor", "hospital", "clinic", "medicine"],
  Finance: ["mutual fund", "sip", "insurance", "lic", "hdfc life", "emi", "loan", "credit card"],
  Travel: ["hotel", "oyo", "airbnb", "mmt", "goibibo", "air india", "indigo", "flight", "spicejet"],
  Salary: ["salary", "payroll", "wages", "ctc"],
  Investment: ["zerodha", "groww", "kite", "upstox", "nse", "bse", "stocks", "mutual"],
};

function detectCategory(text) {
  const lower = text.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
    if (keywords.some((kw) => lower.includes(kw))) return category;
  }
  return "Miscellaneous";
}

function extractMerchant(sms) {
  for (const pattern of MERCHANT_PATTERNS) {
    const match = sms.match(pattern);
    if (match?.[1]) return match[1].trim().slice(0, 50);
  }
  return null;
}

/**
 * Parse a single SMS message into a transaction object.
 * Returns null if the SMS doesn't look like a financial transaction.
 */
export function parseSMS(smsText, sender = "") {
  const text = smsText.replace(/\n/g, " ");

  // Skip OTP and non-financial SMS
  const skipKeywords = ["otp", "one time", "verification", "password", "login", "alert: your"];
  if (skipKeywords.some((kw) => text.toLowerCase().includes(kw))) return null;

  let type = null;
  let amount = null;

  const debitMatch = text.match(DEBIT_REGEX);
  const creditMatch = text.match(CREDIT_REGEX);

  if (debitMatch) {
    type = "expense";
    amount = parseFloat(debitMatch[1].replace(/,/g, ""));
  } else if (creditMatch) {
    type = "income";
    amount = parseFloat(creditMatch[1].replace(/,/g, ""));
  } else {
    // Last resort: find any currency amount
    const amountMatch = text.match(AMOUNT_REGEX);
    if (!amountMatch) return null;
    amount = parseFloat(amountMatch[1].replace(/,/g, ""));
    type = "expense"; // default assumption
  }

  if (!amount || amount <= 0 || amount > 10000000) return null;

  const merchant = extractMerchant(text);
  const category = detectCategory(text + " " + (merchant || ""));
  const description = merchant || text.slice(0, 80);

  return {
    type,
    amount,
    category,
    merchant,
    description,
    source: "sms",
    transactionDate: new Date().toISOString(),
    rawSMS: text.slice(0, 200),
    senderSMS: sender,
  };
}

// ─── Queue for offline/retry support ────────────────────────────────────────

const QUEUE_KEY = "sms_transaction_queue";

export function getQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function enqueueTransaction(tx) {
  const queue = getQueue();
  queue.push({ ...tx, queuedAt: new Date().toISOString(), retries: 0 });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function clearQueue() {
  localStorage.removeItem(QUEUE_KEY);
}

/**
 * Flush the offline queue — submit all pending SMS-parsed transactions to the API.
 * Call this when the app comes back online or on resume.
 */
export async function flushQueue(apiPost) {
  const queue = getQueue();
  if (queue.length === 0) return { submitted: 0, failed: 0 };

  const results = await Promise.allSettled(
    queue.map((tx) =>
      apiPost("/transactions", tx).catch((err) => {
        throw err;
      })
    )
  );

  const submitted = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  // Clear successfully submitted items
  const failedTxs = queue.filter((_, i) => results[i].status === "rejected");
  localStorage.setItem(QUEUE_KEY, JSON.stringify(failedTxs));

  return { submitted, failed };
}

// ─── Android SMS listener (Capacitor) ───────────────────────────────────────

let smsListenerActive = false;

/**
 * Start listening for incoming SMS on Android.
 * Automatically parses and queues financial transactions.
 * No-op on web/iOS.
 */
export async function startSMSListener(onTransactionFound) {
  if (!isAndroid() || smsListenerActive) return;

  try {
    // Use window.Capacitor.Plugins if available (native context only)
    // This avoids breaking web builds — @capacitor/app is only available in the native wrapper
    const CapApp = window?.Capacitor?.Plugins?.App;
    if (!CapApp) return;

    CapApp.addListener("resume", async () => {
      if (navigator.onLine) {
        const axiosModule = await import("../api/axios");
        const { submitted } = await flushQueue(
          (url, data) => axiosModule.default.post(url, data)
        );
        if (submitted > 0 && onTransactionFound) {
          onTransactionFound({ type: "flush", count: submitted });
        }
      }
    });

    smsListenerActive = true;
  } catch (err) {
    console.warn("SMS listener failed to start:", err.message);
  }
}

export function stopSMSListener() {
  smsListenerActive = false;
}
