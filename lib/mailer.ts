import nodemailer from "nodemailer";

// TODO: switch back to SITE_URL (aloe.kg) once the domain points at this deployment
const ADMIN_ORDERS_URL = "https://aloe-next.vercel.app/admin/orders";

type OrderItem = {
  name: string;
  price: number;
  quantity: number;
  image_url: string;
};

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
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    // hoster.kg's cert is issued for *.hoster.kg, not mail.aloe.kg — same server, mismatched name
    tls: { rejectUnauthorized: false },
  });
}

function renderOrderEmailHtml(data: NewOrderEmailData) {
  const itemsRows = data.items
    .map(
      (i) =>
        `<tr>` +
        `<td style="padding:4px 8px;border-bottom:1px solid #eee;width:48px">` +
        `<img src="${i.image_url}" width="40" height="40" style="object-fit:contain;border:1px solid #eee;border-radius:4px" />` +
        `</td>` +
        `<td style="padding:4px 8px;border-bottom:1px solid #eee">${i.name}</td>` +
        `<td style="padding:4px 8px;border-bottom:1px solid #eee;white-space:nowrap">${i.quantity} × ${i.price} сом</td></tr>`,
    )
    .join("");

  return `
    <div style="font-family:sans-serif;font-size:14px;color:#111">
      <h2 style="margin:0 0 12px">Новый заказ #${data.orderId}</h2>
      <p><b>Имя:</b> ${data.name}<br/>
      <b>Телефон:</b> ${data.phone}<br/>
      <b>Адрес:</b> ${data.address}</p>
      ${data.comment ? `<p><b>Комментарий:</b> ${data.comment}</p>` : ""}
      <p><b>Способ доставки:</b> ${data.deliveryLabel}</p>
      <table style="border-collapse:collapse;width:100%;margin:12px 0">${itemsRows}</table>
      <p>
        Товары: ${data.itemsTotal} сом<br/>
        Доставка: ${data.deliveryCost} сом<br/>
        <b>Итого: ${data.total} сом</b>
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
