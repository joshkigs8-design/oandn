import { z } from "zod";

export const FREE_DELIVERY_THRESHOLD = 5000;
export const DELIVERY_FLAT = 350;

/** Payment providers. Only providers with a configured backend can be charged. */
export type PaymentMethod = "mpesa" | "cod";

export const paymentMethods: {
  id: PaymentMethod;
  label: string;
  hint: string;
}[] = [
  {
    id: "mpesa",
    label: "M-Pesa",
    hint: "An STK push prompt is sent to your phone — enter your M-Pesa PIN to pay.",
  },
  {
    id: "cod",
    label: "Cash on Delivery",
    hint: "Pay the rider in cash when your order arrives.",
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
  address: z.string().trim().min(5, "Enter your delivery address").max(300),
  county: z.string().trim().min(2, "Enter your county").max(80),
  town: z.string().trim().min(2, "Enter your town").max(80),
  instructions: z.string().trim().max(500).optional().or(z.literal("")),
  paymentMethod: z.enum(["mpesa", "cod"]),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
