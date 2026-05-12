import { Resend } from 'resend';
import { env } from '@/lib/env';
import { brand } from '@/config/brand';

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const fmtPrice = (cents: number) => `$${(cents / 100).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;

export function renderOrderPaidCustomer(args: {
  orderId: number;
  customerName: string;
  items: { productName: string; packLabel: string; qty: number; lineTotalCents: number }[];
  shippingCents: number;
  totalCents: number;
  successUrl: string;
}): string {
  const rows = args.items
    .map(
      (i) =>
        `<tr><td>${escapeHtml(i.productName)} · ${escapeHtml(i.packLabel)}</td><td align="right">${i.qty}</td><td align="right">${fmtPrice(i.lineTotalCents)}</td></tr>`,
    )
    .join('');
  return `<!doctype html>
<html><body style="font-family:Helvetica,Arial,sans-serif;background:#0A0A0A;color:#F5F0E8;padding:32px">
  <h1 style="font-family:Georgia,serif;color:#C8843A">${escapeHtml(brand.name)}</h1>
  <h2>Pedido #${args.orderId} confirmado</h2>
  <p>Hola ${escapeHtml(args.customerName)}, recibimos tu pago. Te dejamos el resumen:</p>
  <table cellpadding="6" style="border-collapse:collapse;width:100%;margin-top:16px">${rows}</table>
  <p style="margin-top:16px">Envío: ${fmtPrice(args.shippingCents)}<br/><strong>Total: ${fmtPrice(args.totalCents)}</strong></p>
  <p style="margin-top:24px"><a href="${escapeHtml(args.successUrl)}" style="color:#C8843A">Ver detalle del pedido</a></p>
  <p style="margin-top:32px;font-size:12px;color:#8A8780">Te avisamos por mail cuando despachemos tu pedido.</p>
</body></html>`;
}

export function renderOrderPaidOwner(args: {
  orderId: number;
  issue?: 'insufficient_stock' | null;
  customerEmail: string;
  totalCents: number;
}): string {
  const alert = args.issue
    ? `<p style="color:#ff6b6b"><strong>ALERTA:</strong> ${escapeHtml(args.issue)}. Revisar refund manual.</p>`
    : '';
  return `<!doctype html>
<html><body style="font-family:Helvetica,Arial,sans-serif;padding:24px">
  <h2>${args.issue ? 'Pedido con problema' : 'Nuevo pedido pagado'}: #${args.orderId}</h2>
  ${alert}
  <p>Cliente: ${escapeHtml(args.customerEmail)}<br/>Total: ${fmtPrice(args.totalCents)}</p>
  <p><a href="https://example.com/admin/ventas/${args.orderId}">Ver en admin</a></p>
</body></html>`;
}

export async function sendEmail(args: { to: string; subject: string; html: string }): Promise<void> {
  if (!env.RESEND_API_KEY) {
    console.log(`[email/log] to=${args.to} subject="${args.subject}"\n${args.html}`);
    return;
  }
  const resend = new Resend(env.RESEND_API_KEY);
  await resend.emails.send({
    from: `${brand.name} <${brand.email}>`,
    to: args.to,
    subject: args.subject,
    html: args.html,
  });
}
