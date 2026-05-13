import { test, expect } from '@playwright/test';

const OWNER_EMAIL = process.env.OWNER_EMAIL ?? 'martin.minghetti@gmail.com';
const OWNER_PASSWORD = process.env.INITIAL_OWNER_PASSWORD!;

test('owner can edit a product and see the change in list', async ({ page }) => {
  // 1. Login
  await page.goto('/admin/login');
  // The login form uses <label><span>Email</span><input/></label> — implicit label.
  // Use locator('label', hasText) → input to be robust.
  await page.locator('label', { hasText: /^Email$/i }).locator('input').fill(OWNER_EMAIL);
  await page.locator('label', { hasText: /Contraseña/i }).locator('input').fill(OWNER_PASSWORD);
  await page.getByRole('button', { name: /entrar/i }).click();
  await page.waitForURL(/\/admin\/?$/);

  // 2. Dashboard renders with 3 KPI cards
  await expect(page.getByText('Ventas del mes')).toBeVisible();
  await expect(page.getByText('Productos en stock crítico')).toBeVisible();
  await expect(page.getByText('Batches activos')).toBeVisible();

  // 3. Go to productos list (use sidebar link — there might be multiple "Productos" matches)
  await page.getByRole('link', { name: 'Productos' }).first().click();
  await page.waitForURL('**/admin/productos');
  await expect(page.getByRole('heading', { name: 'Productos' })).toBeVisible();

  // 4. Click first row action menu → Editar
  // The actions cell is the last column with a single icon button per row.
  const firstRow = page.getByRole('row').nth(1); // row 0 is header
  await firstRow.getByRole('button').last().click();
  await page.getByRole('menuitem', { name: 'Editar' }).click();
  await page.waitForURL(/\/admin\/productos\/\d+\/edit/);

  // 5. Change reorder point.
  // ProductForm's Field wraps <Label> + children with no htmlFor association,
  // so getByLabel will not work. Target by name attribute.
  const reorderInput = page.locator('input[name="reorderPoint"]');
  await expect(reorderInput).toBeVisible();
  const original = await reorderInput.inputValue();
  const newValue = String(Number(original) + 7);
  await reorderInput.fill(newValue);

  // Seed data uses relative paths for heroImageUrl (e.g. "/products/x.jpg"),
  // but the Zod schema requires a valid absolute URL or empty string. Clear
  // it so submit isn't blocked by pre-existing invalid data.
  const heroInput = page.locator('input[name="heroImageUrl"]');
  await heroInput.fill('');

  await page.getByRole('button', { name: 'Guardar' }).click();

  // 6. Redirected to list with toast (sonner)
  await page.waitForURL('**/admin/productos');
  await expect(page.getByText(/Producto actualizado/i)).toBeVisible({ timeout: 5_000 });

  // 7. Verify list reflects new reorder. Reorder column shows the number;
  // scope to the table to avoid false matches from header copy.
  await expect(
    page.locator('table').getByText(newValue, { exact: true }).first()
  ).toBeVisible();
});
