import "server-only";
import nodemailer from "nodemailer";
import type { OrderItem } from "@/types";

// TODO: switch back to SITE_URL (aloe.kg) once the domain points at this deployment
const ADMIN_ORDERS_URL = "https://aloe-next.vercel.app/admin/orders";

/** Order fields originate from a public checkout form — never interpolate them raw. */
function esc(value: string | number): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Only http(s) URLs reach an <img src> — no `javascript:` or `data:` from a cart item. */
function safeImageUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? esc(url) : "";
}

type NewOrderEmailData = {
  orderId: string;
  name: string;
  phone: string;
  address: string;
  comment: string;
  items: OrderItem[];
  itemsTotal: number;
  deliveryLabel: string;
  deliveryCost: number;
  total: number;
};

function getTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_TLS_SERVERNAME } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    // Loud, because this is the only new-order notification channel: a rotated password or a
    // dropped env var otherwise lets orders pile up unnoticed with nothing in the logs.
    console.error(
      "[mailer] SMTP is not configured — new-order notifications are DISABLED. Missing:",
      [!SMTP_HOST && "SMTP_HOST", !SMTP_PORT && "SMTP_PORT", !SMTP_USER && "SMTP_USER", !SMTP_PASS && "SMTP_PASS"]
        .filter(Boolean)
        .join(", "),
    );
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    // The certificate is issued for *.hoster.kg rather than mail.aloe.kg — same server, mismatched
    // name. `rejectUnauthorized: false` used to paper over that by accepting ANY certificate,
    // which let anyone on the path capture these SMTP credentials and every customer's name,
    // phone and address. Verifying against the name the cert actually covers fixes the mismatch
    // without giving up verification.
    tls: { servername: SMTP_TLS_SERVERNAME || SMTP_HOST },
  });
}

function renderOrderEmailHtml(data: NewOrderEmailData) {
  const itemsRows = data.items
    .map(
      (i) =>
        `<tr>` +
        `<td style="padding:4px 8px;border-bottom:1px solid #eee;width:48px">` +
        `<img src="${safeImageUrl(i.image_url)}" width="40" height="40" style="object-fit:contain;border:1px solid #eee;border-radius:4px" />` +
        `</td>` +
        `<td style="padding:4px 8px;border-bottom:1px solid #eee">${esc(i.name)}</td>` +
        `<td style="padding:4px 8px;border-bottom:1px solid #eee;white-space:nowrap">${esc(i.quantity)} × ${esc(i.price)} сом</td></tr>`,
    )
    .join("");

  return `
    <div style="font-family:sans-serif;font-size:14px;color:#111">
      <h2 style="margin:0 0 12px">Новый заказ #${esc(data.orderId)}</h2>
      <p><b>Имя:</b> ${esc(data.name)}<br/>
      <b>Телефон:</b> ${esc(data.phone)}<br/>
      <b>Адрес:</b> ${esc(data.address)}</p>
      ${data.comment ? `<p><b>Комментарий:</b> ${esc(data.comment)}</p>` : ""}
      <p><b>Способ доставки:</b> ${esc(data.deliveryLabel)}</p>
      <table style="border-collapse:collapse;width:100%;margin:12px 0">${itemsRows}</table>
      <p>
        Товары: ${esc(data.itemsTotal)} сом<br/>
        Доставка: ${esc(data.deliveryCost)} сом<br/>
        <b>Итого: ${esc(data.total)} сом</b>
      </p>
      <p><a href="${ADMIN_ORDERS_URL}">Открыть заказ в админке</a></p>
    </div>
  `;
}

export async function sendNewOrderEmail(data: NewOrderEmailData, invoicePdf?: Buffer) {
  const transport = getTransport();
  const to = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!transport || !to) return;

  try {
    await transport.sendMail({
      from: `"Aloe.kg" <${process.env.SMTP_USER}>`,
      to,
      subject: `Новый заказ #${data.orderId} — ${data.total} сом`,
      html: renderOrderEmailHtml(data),
      attachments: invoicePdf
        ? [{ filename: `nakladnaya-${data.orderId}.pdf`, content: invoicePdf, contentType: "application/pdf" }]
        : undefined,
    });
  } catch (err) {
    console.error("Failed to send new order email", err);
  }
}
