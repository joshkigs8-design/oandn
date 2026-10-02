import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { checkoutSchema, DELIVERY_FLAT, FREE_DELIVERY_THRESHOLD } from "@/lib/checkout";
import { products as fallback } from "@/lib/catalog";
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

    // Prices always come from the database or verified master catalog, never from untrusted browser input.
    const validUuids = data.items
      .map((i) => i.productId)
      .filter((id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));

    let dbRows: Array<{ id: string; name: string; price: number; image: string; in_stock: boolean }> = [];
    if (validUuids.length > 0) {
      const { data: rows, error: productError } = await supabaseAdmin
        .from("products")
        .select("id, name, price, image, in_stock")
        .in("id", validUuids);
      if (productError) throw new Error(productError.message);
      if (rows) dbRows = rows;
    }

    const items = data.items.map((line) => {
      // 1. Try finding in database by id
      let row = dbRows.find((r) => r.id === line.productId);

      // 2. If not found by uuid, resolve from verified master catalog
      if (!row) {
        const catalogItem = fallback.find((p) => p.id === line.productId || p.slug === line.slug);
        if (catalogItem) {
          row = {
            id: catalogItem.id,
            name: catalogItem.name,
            price: catalogItem.price,
            image: catalogItem.image,
            in_stock: Boolean(catalogItem.inStock),
          };
        }
      }

      if (!row) throw new Error(`Product no longer available: ${line.name}`);
      if (!row.in_stock) throw new Error(`${row.name} is sold out`);
      return { ...line, name: row.name, image: row.image, price: row.price };
    });

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FLAT;
    const total = subtotal + deliveryFee;

    const receiptNumber = data.mpesaReceiptNumber?.trim() || null;
    const paymentStatus = receiptNumber
      ? "paid"
      : data.paymentMethod === "cod"
        ? "on_delivery"
        : "pending";

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
        payment_status: paymentStatus,
        mpesa_receipt_number: receiptNumber,
      })
      .select("id")
      .single();
    if (error || !order) throw new Error(error?.message ?? "Could not create the order");

    return {
      orderId: order.id,
      total,
      mpesa: "manual_till" as const,
      paymentStatus,
      receiptNumber,
      message: "Order placed successfully! The owner will call you to confirm dispatch, or you can pay via Till 1673504.",
    };
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
