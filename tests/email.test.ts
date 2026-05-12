import { describe, it, expect } from 'vitest';
import { escapeHtml, renderOrderPaidCustomer, renderOrderPaidOwner } from '@/lib/email';

describe('email', () => {
  it('escapeHtml escapes < > & " \'', () => {
    expect(escapeHtml(`<script>alert("x") & 'y'</script>`)).toBe(
      '&lt;script&gt;alert(&quot;x&quot;) &amp; &#39;y&#39;&lt;/script&gt;',
    );
  });

  it('customer template includes order id and respects html escape', () => {
    const html = renderOrderPaidCustomer({
      orderId: 42,
      customerName: `<b>El "Hacker"</b>`,
      items: [{ productName: 'Cumbre IPA', packLabel: 'Pack 6', qty: 1, lineTotalCents: 1_200_000 }],
      shippingCents: 250_000,
      totalCents: 1_450_000,
      successUrl: 'https://example.com/checkout/exito?token=abc',
    });
    expect(html).toContain('#42');
    expect(html).toContain('&lt;b&gt;');
    expect(html).not.toContain('<b>El');
    expect(html).toContain('Cumbre IPA');
    expect(html).toContain('$14.500');
  });

  it('owner template includes alert lines on insufficient stock', () => {
    const html = renderOrderPaidOwner({
      orderId: 99,
      issue: 'insufficient_stock',
      customerEmail: 'cliente@x.com',
      totalCents: 700_000,
    });
    expect(html).toContain('ALERTA');
    expect(html).toContain('#99');
    expect(html).toContain('insufficient_stock');
  });
});
