import { test, expect } from '@playwright/test';

test.describe('POS SaaS Commercial E2E Flow', () => {
  test('Completes full checkout flow with F1-F4 keyboard shortcuts', async ({ page }) => {
    // 1. Navegar a la app
    await page.goto('http://localhost:3000');

    // 2. Login con credenciales demo
    await page.fill('input[type="email"]', 'admin@possaas.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // 3. Verificación de carga del POS Terminal
    await expect(page.locator('h1')).toContainText('POS SaaS Commercial');

    // 4. Agregar producto haciendo click o presionando F1
    await page.press('body', 'F1');
    await page.fill('input[placeholder*="Buscar"]', 'Refresco');

    // Seleccionar producto de la cuadrícula
    const productCard = page.locator('button:has-text("Refresco de Cola")').first();
    await productCard.click();

    // 5. Verificar que el producto está en el carrito
    await expect(page.locator('text=Ticket de Venta')).toBeVisible();
    await expect(page.locator('text=15.00').or(page.locator('text=18.50'))).toBeVisible();

    // 6. Cobrar usando la tecla F4
    await page.press('body', 'F4');

    // 7. Verificar mensaje de éxito de venta
    await expect(page.locator('text=Venta procesada con éxito')).toBeVisible({ timeout: 5000 });
  });
});
