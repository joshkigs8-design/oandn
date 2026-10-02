import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

/**
 * Server function to register customer accounts with instant email confirmation.
 * This completely avoids the "Email not confirmed" (400 Bad Request) error
 * during customer checkout and registration.
 */
export const registerCustomer = createServerFn({ method: "POST" })
  .validator((input: unknown) => registerSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.trim().toLowerCase();
    const password = data.password;

    // 1. Try to create the user directly with email_confirm = true
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "user" },
    });

    if (createError) {
      // If user is already registered (e.g. from an earlier failed attempt),
      // update password and auto-confirm email so they can log in seamlessly
      const msg = createError.message.toLowerCase();
      if (msg.includes("already") || msg.includes("exists") || createError.status === 422) {
        const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        const existing = usersData?.users.find((u) => u.email?.toLowerCase() === email);
        if (existing) {
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
            password,
            email_confirm: true,
          });
          if (updateError) throw new Error(updateError.message);
          return { success: true, email, updated: true, userId: existing.id };
        }
      }
      throw new Error(createError.message);
    }

    // 2. Ensure customer user role entry exists
    if (createData.user) {
      await supabaseAdmin
        .from("user_roles")
        .upsert(
          {
            user_id: createData.user.id,
            role: "user",
          },
          { onConflict: "user_id" },
        )
        .select();
    }

    return { success: true, email, userId: createData.user?.id };
  });

const confirmEmailSchema = z.object({
  email: z.string().email(),
});

/**
 * Server function to auto-confirm any existing unconfirmed customer account
 * if they try to sign in and hit "Email not confirmed".
 */
export const autoConfirmUser = createServerFn({ method: "POST" })
  .validator((input: unknown) => confirmEmailSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.trim().toLowerCase();

    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existing = usersData?.users.find((u) => u.email?.toLowerCase() === email);
    if (existing) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
        email_confirm: true,
      });
      if (error) throw new Error(error.message);
      return { success: true, confirmed: true };
    }
    return { success: false, notFound: true };
  });
