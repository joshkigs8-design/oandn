import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { checkoutSchema, DELIVERY_FLAT, FREE_DELIVERY_THRESHOLD } from "@/lib/checkout";
import { z } from "zod";

const lineSchema = z.object({
  productId: z.string(),
  slug: z.string(),
  name: z.string(),
  size: z.string(),
  color: z.string(),
  quantity: z.number().int().min(1).max(20),
});

const placeOrderSchema = checkoutSchema.extend({
  items: z.array(lineSchema).min(1).max(50),
});

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => placeOrderSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Prices always come from the database, never from the browser.
    const { data: rows, error: productError } = await supabaseAdmin
      .from("products")
      .select("id, name, price, image, in_stock")
      .in(
        "id",
        data.items.map((i) => i.productId),
      );
    if (productError) throw new Error(productError.message);

    const items = data.items.map((line) => {
      const row = rows?.find((r) => r.id === line.productId);
      if (!row) throw new Error(`Product no longer available: ${line.name}`);
      if (!row.in_stock) throw new Error(`${row.name} is sold out`);
      return { ...line, name: row.name, image: row.image, price: row.price };
    });

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FLAT;
    const total = subtotal + deliveryFee;

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: context.userId,
        full_name: data.fullName,
        phone: data.phone,
        email: data.email,
        address: data.address,
        county: data.county,
        town: data.town,
        instructions: data.instructions ?? "",
        items,
        subtotal,
        delivery_fee: deliveryFee,
        total,
        payment_method: data.paymentMethod,
        status: "pending",
        payment_status: data.paymentMethod === "cod" ? "on_delivery" : "pending",
      })
      .select("id")
      .single();
    if (error || !order) throw new Error(error?.message ?? "Could not create the order");

    if (data.paymentMethod === "cod") {
      return { orderId: order.id, total, mpesa: "not_required" as const };
    }

    const { readMpesaConfig, stkPush } = await import("@/lib/mpesa.server");
    const cfg = readMpesaConfig();
    if (!cfg) {
      await supabaseAdmin
        .from("orders")
        .update({ payment_status: "awaiting_setup" })
        .eq("id", order.id);
      return { orderId: order.id, total, mpesa: "not_configured" as const };
    }

    try {
      const push = await stkPush({
        cfg,
        phone: data.phone,
        amount: total,
        reference: `ON-${order.id.slice(0, 8)}`,
        description: "O&N order",
      });
      await supabaseAdmin
        .from("orders")
        .update({
          mpesa_checkout_request_id: push.checkoutRequestId,
          mpesa_merchant_request_id: push.merchantRequestId,
          payment_status: "stk_sent",
        })
        .eq("id", order.id);
      return { orderId: order.id, total, mpesa: "prompt_sent" as const };
    } catch (err) {
      const message = err instanceof Error ? err.message : "STK push failed";
      await supabaseAdmin
        .from("orders")
        .update({ payment_status: "failed", mpesa_result_desc: message })
        .eq("id", order.id);
      return { orderId: order.id, total, mpesa: "failed" as const, message };
    }
  });

export const getOrderPaymentStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => z.object({ orderId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    // RLS scopes this to the caller's own orders (or an admin).
    const { data: row } = await context.supabase
      .from("orders")
      .select("payment_status, mpesa_result_desc")
      .eq("id", data.orderId)
      .maybeSingle();
    return {
      paymentStatus: row?.payment_status ?? "unknown",
      message: row?.mpesa_result_desc ?? null,
    };
  });
