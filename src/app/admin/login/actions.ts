"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { redirect } from "next/navigation";
import { createSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginState = { error?: string };

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const ip = await getClientIp();
  const limit = rateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
  if (!limit.success) {
    return { error: "Too many login attempts. Please try again in a few minutes." };
  }

  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }

  const { email, password } = parsed.data;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminEmail || !adminHash) {
    return { error: "Admin credentials are not configured on the server." };
  }

  const emailOk =
    email.trim().toLowerCase() === adminEmail.trim().toLowerCase();
  const passwordOk = await bcrypt.compare(password, adminHash);

  if (!emailOk || !passwordOk) {
    return { error: "Invalid email or password." };
  }

  await createSession(adminEmail.trim().toLowerCase());
  redirect("/admin");
}
