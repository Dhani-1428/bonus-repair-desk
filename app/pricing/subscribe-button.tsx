"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { PLAN_PRICING, type SubscriptionPlan } from "@/lib/constants"

interface SubscribeButtonProps {
  plan: SubscriptionPlan
  variant?: "default" | "outline"
  className?: string
}

export function SubscribeButton({ plan, variant = "default", className }: SubscribeButtonProps) {
  const router = useRouter()
  const { user, subscription, updateSubscription } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    setLoading(true)

    try {
      const planDetails = PLAN_PRICING[plan]
      if (!planDetails) {
        throw new Error(`Plan details not found for plan: ${plan}`)
      }
      
      // If user has existing subscription, extend from end date, otherwise start from today
      const existingSubscription = subscription
      const startDate = existingSubscription && new Date(existingSubscription.endDate) > new Date()
        ? new Date(existingSubscription.endDate)
        : new Date()
      
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + planDetails.months)

      const newSubscription = {
        id: existingSubscription?.id || `sub_${Date.now()}`,
        userId: user.id,
        plan,
        status: "active" as const,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        createdAt: existingSubscription?.createdAt || startDate.toISOString(),
      }

      // Save old subscription to history before updating
      if (existingSubscription && typeof window !== "undefined") {
        const subscriptionHistory = JSON.parse(localStorage.getItem(`subscription_history_${user.id}`) || "[]")
        subscriptionHistory.push({
          ...existingSubscription,
          status: "expired" as const, // Mark old subscription as expired in history
        })
        // Keep only last 20 subscriptions in history
        const recentHistory = subscriptionHistory.slice(-20)
        localStorage.setItem(`subscription_history_${user.id}`, JSON.stringify(recentHistory))
      }

      updateSubscription(newSubscription)

      // Send subscription confirmation email
      if (typeof window !== "undefined") {
        import("@/lib/email-service").then(({ sendSubscriptionConfirmationEmail }) => {
          sendSubscriptionConfirmationEmail(user, newSubscription).catch(console.error)
        })
      }

      router.push("/checkout/success")
    } catch (error) {
      console.error("[v0] Subscribe error:", error)
      alert("Failed to create subscription. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button className={className || "w-full"} variant={variant} onClick={handleSubscribe} disabled={loading}>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        "Get Started"
      )}
    </Button>
  )
}
