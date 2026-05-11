// ─── Re-export Prisma enums so apps don't need to import from @ecom/db directly ──
export type {
  Role,
  UserStatus,
  VendorStatus,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  DeliveryPartnerStatus,
  AssignmentStatus,
  SettlementStatus,
  CouponType,
  FlashSaleStatus,
  ReviewStatus,
} from '@ecom/db'

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface TokenPayload {
  sub: string       // user id
  role: string
  iat: number
  exp: number
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

// ─── Product ──────────────────────────────────────────────────────────────────

export interface ProductAttributes {
  size?: string
  color?: string
  material?: string
  [key: string]: string | undefined
}

// ─── Order ────────────────────────────────────────────────────────────────────

export interface DeliveryAddressSnapshot {
  label: string
  street: string
  city: string
  province: string
  postalCode?: string
  lat?: number
  lng?: number
  recipientName: string
  recipientPhone: string
}

// ─── Payment ──────────────────────────────────────────────────────────────────

export interface EsewaPaymentParams {
  amount: number
  taxAmount: number
  totalAmount: number
  transactionUuid: string
  productCode: string
  productServiceCharge: number
  productDeliveryCharge: number
  successUrl: string
  failureUrl: string
  signedFieldNames: string
  signature: string
}

export interface KhaltiInitiatePayload {
  return_url: string
  website_url: string
  amount: number   // in paisa
  purchase_order_id: string
  purchase_order_name: string
  customer_info: {
    name: string
    email?: string
    phone: string
  }
}

export interface KhaltiVerifyResponse {
  pidx: string
  total_amount: number
  status: 'Completed' | 'Pending' | 'Expired' | 'User canceled' | 'Refunded'
  transaction_id: string
  fee: number
  refunded: boolean
}

// ─── WhatsApp ─────────────────────────────────────────────────────────────────

export interface WhatsAppWebhookPayload {
  object: string
  entry: Array<{
    id: string
    changes: Array<{
      value: {
        messaging_product: string
        metadata: { display_phone_number: string; phone_number_id: string }
        messages?: Array<{
          from: string
          id: string
          timestamp: string
          text?: { body: string }
          type: string
        }>
        statuses?: Array<{
          id: string
          status: string
          timestamp: string
          recipient_id: string
        }>
      }
      field: string
    }>
  }>
}

// ─── Flash Sale ───────────────────────────────────────────────────────────────

export interface FlashSaleStockInfo {
  flashSaleItemId: string
  remaining: number
  total: number
}

// ─── Delivery Tracking ────────────────────────────────────────────────────────

export interface TrackingUpdate {
  assignmentId: string
  lat: number
  lng: number
  status?: string
  timestamp: string
}

export interface OrderTrackingRoom {
  orderId: string
}
