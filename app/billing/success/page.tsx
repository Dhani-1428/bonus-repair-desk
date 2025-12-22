"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function BillingSuccessPage() {
  const router = useRouter()

  return (
    <DashboardLayout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full shadow-2xl border border-gray-800/50 bg-gradient-to-br from-gray-900/95 via-black/95 to-gray-900/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl text-white">Payment Submitted Successfully!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 text-yellow-400">
              <Clock className="w-5 h-5" />
              <p className="font-semibold">Processing Your Payment</p>
            </div>
            <p className="text-gray-300">
              Your payment has been submitted and is pending admin approval.
            </p>
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-300 font-semibold mb-1">
                ⏰ Activation Timeline
              </p>
              <p className="text-xs text-blue-200">
                Your admin panel will be activated within <strong>15 minutes</strong> after admin approval. You'll receive a confirmation email once your subscription is active.
              </p>
            </div>
            <p className="text-sm text-gray-400">
              All your data is safe and will be available once your subscription is activated.
            </p>
            <Button
              onClick={() => router.push("/subscription")}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              View Subscription Status
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

