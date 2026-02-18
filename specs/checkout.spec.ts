import { test, expect } from '@playwright/test'
import paymentFixtures from '../fixtures/payment.json'

test.describe('Checkout — Flujo de pago', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/checkout')
  })

  // ─────────────────────────────────────────────
  // NIVEL FÁCIL — data-test-id y texto directo
  // Si se cambia data-test-id="checkout-btn" o el texto "Pagar" en el front,
  // estos tests rompen de forma obvia y el LLM lo detecta con pattern matching.
  // ─────────────────────────────────────────────

  test('muestra el resumen del pedido correctamente', async ({ page }) => {
    await expect(page.getByTestId('checkout-title')).toBeVisible()
    await expect(page.getByTestId('order-amount')).toContainText('$100.00 USD')
    await expect(page.getByTestId('payment-method')).toContainText('DEUNA')
  })

  test('el botón de pago tiene el texto correcto', async ({ page }) => {
    const btn = page.getByTestId('checkout-btn')
    await expect(btn).toBeVisible()
    await expect(btn).toHaveText('Pagar')
  })

  test('completar el flujo de pago exitosamente', async ({ page }) => {
    await page.getByTestId('checkout-btn').click()
    await expect(page.getByTestId('confirmation-message')).toBeVisible()
    await expect(page.getByTestId('confirmation-message')).toContainText(
      'Pago confirmado exitosamente'
    )
  })

  test('el botón cancelar aparece tras confirmar el pago', async ({ page }) => {
    await page.getByTestId('checkout-btn').click()
    await expect(page.getByTestId('cancel-btn')).toBeVisible()
    await page.getByTestId('cancel-btn').click()
    await expect(page.getByTestId('checkout-btn')).toBeVisible()
  })

  // ─────────────────────────────────────────────
  // NIVEL MEDIO — interacción con elemento anidado
  // El onClick está en el div padre, no en el button.
  // Si el front mueve o elimina el wrapper, el test puede fallar de forma sutil.
  // ─────────────────────────────────────────────

  test('el método de pago alternativo es clickeable', async ({ page }) => {
    const wrapper = page.getByTestId('alternative-pay-wrapper')
    const btn = page.getByTestId('alternative-pay-btn')

    await expect(wrapper).toBeVisible()
    await expect(btn).toBeVisible()

    // El click se hace sobre el botón, pero el handler está en el wrapper padre.
    // Si el front mueve el onClick al button directamente, este test sigue pasando.
    // Si el front elimina el wrapper, el test falla.
    await btn.click()
  })

  test('el wrapper del pago alternativo tiene el handler de click', async ({ page }) => {
    const wrapper = page.getByTestId('alternative-pay-wrapper')
    // Valida que el wrapper responde al click (indirectamente, vía dialog)
    page.on('dialog', (dialog) => dialog.dismiss())
    await wrapper.click()
  })

  // ─────────────────────────────────────────────
  // NIVEL DIFÍCIL — lógica condicional en el front
  // El botón "Pago Express DEUNA" solo aparece si isUserEligible=true.
  // Si el front cambia esa condición, el elemento puede no estar en el DOM.
  // El LLM no puede saber si falla seguro — depende del estado del test.
  // ─────────────────────────────────────────────

  test('muestra el botón de Pago Express DEUNA para usuarios elegibles', async ({ page }) => {
    // Este test asume que la página se renderiza con isUserEligible=true (default).
    // Si el front cambia la condición o la prop default, el botón desaparece.
    const expressBtn = page.getByTestId('deuna-express-btn')
    await expect(expressBtn).toBeVisible()
    await expect(expressBtn).toHaveText('Pago Express DEUNA')
  })

  test('el botón Express DEUNA inicia el flujo de pago', async ({ page }) => {
    // RIESGO ALTO si isUserEligible cambia a false en el setup del test.
    await page.getByTestId('deuna-express-btn').click()
    await expect(page.getByTestId('confirmation-message')).toBeVisible()
  })

})
