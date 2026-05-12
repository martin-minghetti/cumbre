import { test, expect } from '@playwright/test';

/**
 * The AgeGate modal reads from sessionStorage ('cumbre_age_ok').
 * Each Playwright test gets a fresh browser context (empty session storage),
 * so we pre-seed the flag before navigating to avoid the blocking overlay.
 */
async function bypassAgeGate(page: import('@playwright/test').Page) {
  // Open a page first so we have a window context to write sessionStorage
  await page.goto('/');
  await page.evaluate(() => {
    window.sessionStorage.setItem('cumbre_age_ok', '1');
  });
}

test('happy path: home → PDP → add to cart → checkout → simulated approve → success', async ({ page }) => {
  // 0. Bypass AgeGate (pre-seed sessionStorage before any interaction)
  await bypassAgeGate(page);

  // 1. Home
  await expect(page.locator('h1').first()).toBeVisible();

  // 2. Catalog
  await page.goto('/cervezas');
  // Click any product card link
  await page.locator('a[href^="/cervezas/"]').first().click();

  // 3. PDP — add to cart
  await expect(page.locator('h1')).toBeVisible();
  // The button label is "Agregar · $X.XXX" — match by prefix
  const addButton = page.getByRole('button', { name: /^Agregar/i }).first();
  await addButton.click();

  // Wait for the "✓ agregado" feedback (button text changes after successful add)
  await expect(
    page.getByRole('button', { name: /agregado/i }).first()
  ).toBeVisible({ timeout: 5000 });

  // 4. Cart
  await page.goto('/carrito');
  await expect(page.getByRole('heading', { name: /Carrito/i })).toBeVisible();

  await page.getByRole('link', { name: /ir al checkout/i }).click();

  // 5. Checkout
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByRole('heading', { name: /Cerrar tu pedido/i })).toBeVisible();

  // Pickup is selected by default. Fill customer fields.
  // Fields are rendered via a Field component: <label><span>Email</span><input /></label>
  await page.locator('label', { hasText: /^Email$/i }).locator('input').fill('cliente@test.com');
  await page.locator('label', { hasText: /Nombre completo/i }).locator('input').fill('Cliente Test');
  await page.locator('label', { hasText: /Teléfono/i }).locator('input').fill('+54 9 294 555-0000');

  // 6. Submit
  await page.getByRole('button', { name: /pagar/i }).click();

  // 7. Simulated page
  await page.waitForURL(/\/checkout\/simulated\/\d+/, { timeout: 15_000 });
  await expect(page.getByText(/pago simulado/i)).toBeVisible();

  // Approve
  await page.getByRole('button', { name: /aprobar pago/i }).click();

  // 8. Success
  await page.waitForURL(/\/checkout\/exito\?token=/, { timeout: 15_000 });
  await expect(page.getByText(/pago confirmado/i)).toBeVisible();
  await expect(page.getByText(/Gracias/i)).toBeVisible();
});
