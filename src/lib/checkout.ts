import { z } from "zod";

export const FREE_DELIVERY_THRESHOLD = 5000;
export const DELIVERY_FLAT = 350;
export const TILL_NUMBER = "1673504";

/** Payment providers. Manual M-Pesa Buy Goods Till & Call to Confirm */
export type PaymentMethod = "mpesa" | "cod";

export const paymentMethods: {
  id: PaymentMethod;
  label: string;
  hint: string;
}[] = [
  {
    id: "mpesa",
    label: "Lipa na M-PESA (Buy Goods Till: 1673504)",
    hint: "Pay via Till 1673504 (O&N FITS). You can pay now & enter code, or place order and owner will call you to confirm.",
  },
  {
    id: "cod",
    label: "Order & Owner Calls to Confirm",
    hint: "Place your order now. The owner will call you directly to confirm sizing and dispatch payment.",
  },
];

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(100),
  phone: z
    .string()
    .trim()
    .regex(
      /^(?:\+?254|0)?[17]\d{8}$/,
      "Enter a valid Kenyan phone number (e.g. 0712345678 or 0112345678)",
    ),
  email: z.string().trim().email("Enter a valid email address").max(255),
  address: z.string().trim().min(3, "Enter your delivery address").max(300),
  county: z.string().trim().min(2, "Enter your county").max(80),
  town: z.string().trim().min(2, "Enter your town").max(80),
  instructions: z.string().trim().max(500).optional().or(z.literal("")),
  paymentMethod: z.enum(["mpesa", "cod"]),
  mpesaReceiptNumber: z.string().trim().max(30).optional().or(z.literal("")),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
