import axios from 'axios'
import { KhaltiInitiatePayload, KhaltiVerifyResponse } from '@ecom/types'

const SECRET_KEY = process.env.KHALTI_SECRET_KEY!
const BASE_URL = process.env.KHALTI_BASE_URL ?? 'https://a.khalti.com/api/v2'

const khaltiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Key ${SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
})

export async function initiateKhaltiPayment(payload: KhaltiInitiatePayload): Promise<{
  pidx: string
  payment_url: string
  expires_at: string
}> {
  const { data } = await khaltiClient.post('/epayment/initiate/', payload)
  return data
}

export async function verifyKhaltiPayment(pidx: string): Promise<KhaltiVerifyResponse> {
  const { data } = await khaltiClient.post('/epayment/lookup/', { pidx })
  return data
}
