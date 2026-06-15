import "server-only";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { formatINR, formatUnit, decimalToNumber } from "@/lib/format";

function isSmtpConfigured(): boolean {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  return Boolean(
    SMTP_HOST &&
      SMTP_USER &&
      SMTP_PASS &&
      !SMTP_HOST.includes("yourdomain") &&
      !SMTP_USER.includes("yourdomain"),
  );
}

function getTransporter() {
  const port = Number(process.env.SMTP_PORT ?? 465);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

/**
 * Sends the order confirmation email. Fire-and-forget: never throws, so it can
 * be called from the webhook without blocking or breaking the 200 response.
 */
export async function sendOrderConfirmation(orderId: string): Promise<void> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        address: true,
        items: { include: { variant: { include: { product: true } } } },
      },
    });
    if (!order) return;

    if (!isSmtpConfigured()) {
      console.warn(
        `[mailer] SMTP not configured — skipping confirmation email for order ${order.id}.`,
      );
      return;
    }

    const rows = order.items
      .map((item) => {
        const price = decimalToNumber(item.price) ?? 0;
        return `<tr>
          <td style="padding:6px 0;">${item.variant.product.name} (${formatUnit(
            item.variant.unitValue,
            item.variant.unitType,
          )}) × ${item.qty}</td>
          <td style="padding:6px 0;text-align:right;">${formatINR(price * item.qty)}</td>
        </tr>`;
      })
      .join("");

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#1a1a1a;">
        <h1 style="color:#8B0000;">Thank you for your order!</h1>
        <p>Hi ${order.customer.name}, we've received your order <strong>#${order.id.slice(
          0,
          8,
        )}</strong> and payment was successful.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          ${rows}
          <tr style="border-top:1px solid #ddd;font-weight:bold;">
            <td style="padding:10px 0;">Total</td>
            <td style="padding:10px 0;text-align:right;">${formatINR(
              decimalToNumber(order.total) ?? 0,
            )}</td>
          </tr>
        </table>
        ${
          order.address
            ? `<p style="color:#555;">Shipping to:<br/>${order.address.line1}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}</p>`
            : ""
        }
        <p style="color:#888;font-size:12px;">Kavi Foods — Authentic South Indian foods.</p>
      </div>`;

    await getTransporter().sendMail({
      from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
      to: order.customer.email,
      subject: `Your Kavi order #${order.id.slice(0, 8)} is confirmed`,
      html,
    });
  } catch (err) {
    console.error(`[mailer] Failed to send confirmation for ${orderId}:`, err);
  }
}

/**
 * Sends a contact-form message to the store inbox. Returns whether it was
 * actually delivered (false when SMTP isn't configured yet).
 */
export async function sendContactEmail(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ sent: boolean }> {
  if (!isSmtpConfigured()) return { sent: false };
  const to = process.env.SMTP_FROM ?? process.env.SMTP_USER;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#1a1a1a;">
      <h2 style="color:#8B0000;">New contact message</h2>
      <p><strong>From:</strong> ${input.name} &lt;${input.email}&gt;</p>
      <p><strong>Subject:</strong> ${input.subject || "(none)"}</p>
      <p style="white-space:pre-line;border-top:1px solid #ddd;padding-top:12px;">${input.message}</p>
    </div>`;
  try {
    await getTransporter().sendMail({
      from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
      to,
      replyTo: input.email,
      subject: `[Contact] ${input.subject || "New message"}`,
      html,
    });
    return { sent: true };
  } catch (err) {
    console.error("[mailer] Failed to send contact message:", err);
    return { sent: false };
  }
}
