import type { Subscription, User } from "@/lib/constants"
import { PLAN_PRICING } from "@/lib/constants"

/**
 * Get plan pricing, checking localStorage first for custom pricing
 */
function getPlanPricing() {
  if (typeof window === "undefined") return PLAN_PRICING
  
  const stored = localStorage.getItem("plan_pricing")
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (error) {
      console.error("Error parsing plan pricing from localStorage:", error)
    }
  }
  
  return PLAN_PRICING
}

/**
 * Get all subscriptions for all users
 */
export function getAllSubscriptions(): Array<Subscription & { user: User }> {
  if (typeof window === "undefined") return []

  const users = JSON.parse(localStorage.getItem("users") || "[]")
  const subscriptions: Array<Subscription & { user: User }> = []

  users.forEach((user: User) => {
    const subData = localStorage.getItem(`subscription_${user.id}`)
    if (subData) {
      try {
        const subscription = JSON.parse(subData) as Subscription
        subscriptions.push({ ...subscription, user })
      } catch (error) {
        console.error(`Error parsing subscription for user ${user.id}:`, error)
      }
    }
  })

  return subscriptions
}

/**
 * Check if subscription is expiring soon (within days)
 * Uses calculated end date for free trials to ensure accuracy
 */
export function isExpiringSoon(subscription: Subscription, days: number = 7): boolean {
  if (subscription.status !== "active" && subscription.status !== "free_trial" && subscription.status !== "FREE_TRIAL" && !subscription.isFreeTrial) return false

  const endDate = getSubscriptionEndDate(subscription)
  const today = new Date()
  // Normalize both dates to start of day for accurate day calculation
  today.setHours(0, 0, 0, 0)
  today.setMinutes(0, 0, 0)
  today.setSeconds(0, 0)
  today.setMilliseconds(0)
  
  const endDateNormalized = new Date(endDate)
  endDateNormalized.setHours(0, 0, 0, 0)
  endDateNormalized.setMinutes(0, 0, 0)
  endDateNormalized.setSeconds(0, 0)
  endDateNormalized.setMilliseconds(0)
  
  const diffTime = endDateNormalized.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays >= 0 && diffDays <= days
}

/**
 * Check if subscription hasn't started yet
 */
export function isNotStarted(subscription: Subscription): boolean {
  const startDate = new Date(subscription.startDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset time to start of day for comparison
  startDate.setHours(0, 0, 0, 0)
  return startDate > today
}

/**
 * Check if subscription is expired
 * Uses calculated end date for free trials to ensure accuracy
 */
export function isExpired(subscription: Subscription): boolean {
  if (subscription.status === "expired" || subscription.status === "EXPIRED" || subscription.status === "cancelled" || subscription.status === "CANCELLED") return true
  if (subscription.status === "pending" || subscription.status === "PENDING") return false // Pending subscriptions are not expired yet
  if (isNotStarted(subscription)) return false // Not started subscriptions are not expired

  const endDate = getSubscriptionEndDate(subscription)
  const today = new Date()
  // Normalize both dates to start of day for accurate comparison
  today.setHours(0, 0, 0, 0)
  today.setMinutes(0, 0, 0)
  today.setSeconds(0, 0)
  today.setMilliseconds(0)
  
  const endDateNormalized = new Date(endDate)
  endDateNormalized.setHours(0, 0, 0, 0)
  endDateNormalized.setMinutes(0, 0, 0)
  endDateNormalized.setSeconds(0, 0)
  endDateNormalized.setMilliseconds(0)
  
  return endDateNormalized < today
}

/**
 * Get the correct end date for a subscription
 * For free trials, calculate from startDate + 15 days to ensure accuracy
 * For other subscriptions, use the stored endDate
 */
export function getSubscriptionEndDate(subscription: Subscription): Date {
  // For free trials, always calculate from startDate + 15 days
  // This ensures the date is always correct regardless of stored data
  if (subscription.isFreeTrial || subscription.status === "free_trial" || subscription.status === "FREE_TRIAL") {
    const startDate = new Date(subscription.startDate)
    // Normalize to start of day in local timezone
    startDate.setHours(0, 0, 0, 0)
    startDate.setMinutes(0, 0, 0)
    startDate.setSeconds(0, 0)
    startDate.setMilliseconds(0)
    
    // Calculate end date: startDate + 15 days
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 15)
    endDate.setHours(23, 59, 59, 999) // End of day
    
    return endDate
  }
  
  // For non-trial subscriptions, use the stored endDate
  return new Date(subscription.endDate)
}

/**
 * Get days until expiration
 * Uses calculated end date for free trials to ensure accuracy
 */
export function getDaysUntilExpiration(subscription: Subscription): number {
  const endDate = getSubscriptionEndDate(subscription)
  const today = new Date()
  // Normalize both dates to start of day for accurate day calculation
  today.setHours(0, 0, 0, 0)
  today.setMinutes(0, 0, 0)
  today.setSeconds(0, 0)
  today.setMilliseconds(0)
  
  const endDateNormalized = new Date(endDate)
  endDateNormalized.setHours(0, 0, 0, 0)
  endDateNormalized.setMinutes(0, 0, 0)
  endDateNormalized.setSeconds(0, 0)
  endDateNormalized.setMilliseconds(0)
  
  const diffTime = endDateNormalized.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Get subscription price
 */
export function getSubscriptionPrice(subscription: Subscription): number {
  const pricing = getPlanPricing()
  return pricing[subscription.plan]?.price || 0
}

/**
 * Get expiring subscriptions
 */
export function getExpiringSubscriptions(days: number = 7): Array<Subscription & { user: User; daysUntilExpiration: number; price: number }> {
  const allSubscriptions = getAllSubscriptions()
  return allSubscriptions
    .filter((sub) => isExpiringSoon(sub, days) || isExpired(sub))
    .map((sub) => ({
      ...sub,
      daysUntilExpiration: getDaysUntilExpiration(sub),
      price: getSubscriptionPrice(sub),
    }))
    .sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration)
}

