/**
 * Safaricom Daraja (M-Pesa) STK Push helper. Server-only.
 *
 * Required secrets:
 *   MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORTCODE,
 *   MPESA_PASSKEY, MPESA_CALLBACK_URL, MPESA_ENV ("sandbox" | "production")
 */

export type MpesaConfig = {
  consumerKey: string;
  consumerSecret: string;
  shortcode: string;
  passkey: string;
  callbackUrl: string;
  baseUrl: string;
};

export function readMpesaConfig(): MpesaConfig | null {
  const consumerKey = process.env["MPESA_CONSUMER_KEY"];
  const consumerSecret = process.env["MPESA_CONSUMER_SECRET"];
  const shortcode = process.env["MPESA_SHORTCODE"];
  const passkey = process.env["MPESA_PASSKEY"];
  const callbackUrl = process.env["MPESA_CALLBACK_URL"];
  if (!consumerKey || !consumerSecret || !shortcode || !passkey || !callbackUrl) return null;
  const env = process.env["MPESA_ENV"] ?? "sandbox";
  return {
    consumerKey,
    consumerSecret,
    shortcode,
    passkey,
    callbackUrl,
    baseUrl:
      env === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke",
  };
}

/** 254XXXXXXXXX */
export function normalizeMsisdn(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.length === 9) return `254${digits}`;
  return digits;
}

function timestamp() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

async function getAccessToken(cfg: MpesaConfig) {
  const basic = btoa(`${cfg.consumerKey}:${cfg.consumerSecret}`);
  const res = await fetch(`${cfg.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${basic}` },
  });
  if (!res.ok) throw new Error(`M-Pesa auth failed (${res.status})`);
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("M-Pesa auth returned no token");
  return json.access_token;
}

export async function stkPush(opts: {
  cfg: MpesaConfig;
  phone: string;
  amount: number;
  reference: string;
  description: string;
}) {
  const { cfg } = opts;
  const token = await getAccessToken(cfg);
  const ts = timestamp();
  const password = btoa(`${cfg.shortcode}${cfg.passkey}${ts}`);

  const res = await fetch(`${cfg.baseUrl}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({
      BusinessShortCode: cfg.shortcode,
      Password: password,
      Timestamp: ts,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.max(1, Math.round(opts.amount)),
      PartyA: normalizeMsisdn(opts.phone),
      PartyB: cfg.shortcode,
      PhoneNumber: normalizeMsisdn(opts.phone),
      CallBackURL: cfg.callbackUrl,
      AccountReference: opts.reference.slice(0, 12),
      TransactionDesc: opts.description.slice(0, 13),
    }),
  });

  const json = (await res.json()) as {
    CheckoutRequestID?: string;
    MerchantRequestID?: string;
    ResponseCode?: string;
    ResponseDescription?: string;
    errorMessage?: string;
  };
  if (!res.ok || json.ResponseCode !== "0") {
    throw new Error(json.errorMessage ?? json.ResponseDescription ?? "STK push failed");
  }
  return {
    checkoutRequestId: json.CheckoutRequestID ?? null,
    merchantRequestId: json.MerchantRequestID ?? null,
  };
}
