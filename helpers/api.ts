import { APIRequestContext } from '@playwright/test'

export async function postPayment(
  request: APIRequestContext,
  payload: Record<string, unknown>
) {
  return request.post('/api/payment/deuna', { data: payload })
}

export async function confirmPayment(
  request: APIRequestContext,
  referenceId: string
) {
  return request.post('/api/payment/confirm', { data: { referenceId } })
}
