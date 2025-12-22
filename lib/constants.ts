export type SubscriptionPlan = "MONTHLY" | "THREE_MONTH" | "SIX_MONTH" | "TWELVE_MONTH"

export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED" | "PENDING" | "FREE_TRIAL"
export type PaymentStatus = "PENDING" | "APPROVED" | "REJECTED"

export interface User {
  id: string
  name: string
  email: string
  password?: string // Only stored in localStorage, not returned to client
  shopName?: string
  contactNumber?: string
  role?: "admin" | "member" | "super_admin"
  createdAt: string
}

export interface Subscription {
  id: string
  userId: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  startDate: string
  endDate: string
  price?: number
  paymentStatus?: PaymentStatus
  paymentId?: string
  isFreeTrial?: boolean
  createdAt: string
}

export const PLAN_PRICING = {
  MONTHLY: {
    name: "Monthly",
    price: 25,
    months: 1,
    features: ["Repair Ticket Management", "Customer Database", "Payment Processing", "Analytics & Reports", "Email Support", "Team Management"],
  },
  THREE_MONTH: {
    name: "3 Months",
    price: 70,
    months: 3,
    features: ["Repair Ticket Management", "Customer Database", "Payment Processing", "Analytics & Reports", "Email Support", "Team Management"],
  },
  SIX_MONTH: {
    name: "6 Months",
    price: 130,
    months: 6,
    features: [
      "Everything in 3 Months",
      "Advanced Analytics",
      "Priority Support",
      "Custom Reports",
      "API Access",
      "Data Export",
    ],
  },
  TWELVE_MONTH: {
    name: "12 Months",
    price: 210,
    months: 12,
    features: [
      "Everything in 6 Months",
      "Unlimited Tickets",
      "Dedicated Support",
      "Custom Integrations",
      "White Label Options",
      "Advanced Security",
    ],
  },
}
