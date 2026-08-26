import { createFileRoute } from "@tanstack/react-router";

type CallbackItem = { Name: string; Value?: string | number };

export const Route = createFileRoute("/api/public/mpesa-callback")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Optional shared-secret guard: append ?token=<MPESA_CALLBACK_TOKEN> to the
        // callback URL configured on Daraja so nobody else can mark orders paid.
        const expected = process.env["MPESA_CALLBACK_TOKEN"];
        if (expected) {
          const provided = new URL(request.url).searchParams.get("token");
          if (provided !== expected) return new Response("Unauthorized", { status: 401 });
        }

        type StkCallbackPayload = {
          Body?: {
            stkCallback?: {
              CheckoutRequestID?: string;
              MerchantRequestID?: string;
              ResultCode?: number;
              ResultDesc?: string;
              CallbackMetadata?: {
                Item?: CallbackItem[];
              };
            };
          };
        };

        let payload: StkCallbackPayload | undefined;
        try {
          payload = (await request.json()) as StkCallbackPayload;
        } catch {
          return new Response("Bad request", { status: 400 });
        }

        const cb = payload?.Body?.stkCallback;
        const checkoutRequestId: string | undefined = cb?.CheckoutRequestID;
        if (!checkoutRequestId) {
          return Response.json({ ResultCode: 0, ResultDesc: "Ignored" });
        }

        const meta: CallbackItem[] = cb?.CallbackMetadata?.Item ?? [];
        const receipt = meta.find((i) => i.Name === "MpesaReceiptNumber")?.Value;
        const success = cb?.ResultCode === 0;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin
          .from("orders")
          .update({
            payment_status: success ? "paid" : "failed",
            status: success ? "confirmed" : "pending",
            mpesa_receipt_number: receipt ? String(receipt) : null,
            mpesa_result_desc: cb?.ResultDesc ?? null,
          })
          .eq("mpesa_checkout_request_id", checkoutRequestId);

        return Response.json({ ResultCode: 0, ResultDesc: "Accepted" });
      },
    },
  },
});
