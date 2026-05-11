import crypto from 'crypto'
import axios from 'axios'
import { EsewaPaymentParams } from '@ecom/types'

const MERCHANT_CODE = process.env.ESEWA_MERCHANT_CODE!
const SECRET_KEY = process.env.ESEWA_SECRET_KEY!
const BASE_URL = process.env.ESEWA_BASE_URL ?? 'https://rc-epay.esewa.com.np'

export function buildEsewaParams(
  transactionUuid: string,
  amount: number,
  deliveryCharge = 0,
): EsewaPaymentParams {
  const productCode = MERCHANT_CODE
  const taxAmount = 0
  const serviceCharge = 0
  const totalAmount = amount + taxAmount + serviceCharge + deliveryCharge

  const signedFieldNames = 'total_amount,transaction_uuid,product_code'
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(message)
    .digest('base64')

  return {
    amount,
    taxAmount,
    totalAmount,
    transactionUuid,
    productCode,
    productServiceCharge: serviceCharge,
    productDeliveryCharge: deliveryCharge,
    successUrl: process.env.ESEWA_SUCCESS_URL!,
    failureUrl: process.env.ESEWA_FAILURE_URL!,
    signedFieldNames,
    signature,
  }
}

export async function verifyEsewaPayment(
  totalAmount: number,
  transactionUuid: string,
  encodedData: string,
): Promise<boolean> {
  try {
    const decoded = Buffer.from(encodedData, 'base64').toString('utf-8')
    const response = JSON.parse(decoded) as {
      status: string
      total_amount: string
      transaction_uuid: string
      product_code: string
      signed_field_names: string
      signature: string
    }

    if (response.status !== 'COMPLETE') return false

    // Verify signature
    const fields = response.signed_field_names.split(',')
    const message = fields.map((f) => `${f}=${(response as Record<string, string>)[f]}`).join(',')
    const expected = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(message)
      .digest('base64')

    if (expected !== response.signature) return false
    if (Number(response.total_amount.replace(',', '')) !== totalAmount) return false
    if (response.transaction_uuid !== transactionUuid) return false

    return true
  } catch {
    return false
  }
}

export const ESEWA_PAYMENT_URL = `${BASE_URL}/api/epay/main/v2/form`
