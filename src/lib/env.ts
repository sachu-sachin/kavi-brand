import "server-only";
import { z } from "zod";

// Always-required server environment. Payment/SMTP vars are validated lazily at
// their point of use so the app still runs in dev before they're configured.
const schema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  SESSION_SECRET: z
    .string()
    .min(16, "SESSION_SECRET must be set (use 32+ random hex chars)"),
  ADMIN_EMAIL: z.string().email("ADMIN_EMAIL must be a valid email"),
  ADMIN_PASSWORD_HASH: z.string().min(1, "ADMIN_PASSWORD_HASH is required"),
  NEXT_PUBLIC_SITE_URL: z.string().url("NEXT_PUBLIC_SITE_URL must be a valid URL"),
});

let validated = false;

export function assertServerEnv(): void {
  if (validated) return;
  const result = schema.safeParse(process.env);
  if (!result.success) {
    const details = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid server environment variables:\n${details}`);
  }
  validated = true;
}
