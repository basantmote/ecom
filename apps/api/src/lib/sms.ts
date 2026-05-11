import axios from 'axios'
import { logger } from './logger'

const SPARROW_API_URL = 'https://apisms.sparrowsms.com/v2/sms/'
const TOKEN = process.env.SMS_API_KEY
const SENDER = process.env.SMS_SENDER_NAME ?? 'ECOM'

export async function sendSms(to: string, text: string): Promise<void> {
  if (!TOKEN) {
    // Log OTP in development when no SMS key is configured
    logger.warn(`[SMS STUB] To: ${to} | Message: ${text}`)
    return
  }

  await axios.post(
    SPARROW_API_URL,
    { token: TOKEN, from: SENDER, to, text },
    { headers: { 'Content-Type': 'application/json' } },
  )
}
