"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"
import { Navbar } from "@/components/navbar"

function SuccessContent() {
  const router = useRouter()
  const [verifying, setVerifying] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVerifying(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (verifying) {
    return (
      <div className="flex flex-col min-h-screen bg-black">
        <Navbar />
        <main className="flex-1 py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <Card className="max-w-md w-full bg-zinc-900 border-zinc-800">
            <CardHeader className="text-center">
              <Loader2 className="h-16 w-16 animate-spin text-white mx-auto mb-4" />
              <CardTitle className="text-white">Processing Your Subscription</CardTitle>
              <CardDescription className="text-gray-400">
                Please wait while we set up your admin panel...
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
        {/* Developer Credit */}
        <div className="py-8 border-t border-gray-800/50 bg-black/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <p className="text-center text-sm text-gray-400">
              Developed by{" "}
              <a
                href="https://bonusitsolutions.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors duration-300 font-medium hover:underline"
              >
                Bonus IT Solutions
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar />
      <main className="flex-1 py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <Card className="max-w-md w-full bg-zinc-900 border-zinc-800 animate-fade-in">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                <CheckCircle className="h-10 w-10 text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl text-white">Subscription Activated!</CardTitle>
            <CardDescription className="text-gray-400">Your custom admin panel is now ready</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-zinc-800 rounded-lg p-4 space-y-2">
              <p className="text-sm text-gray-300">
                Thank you for subscribing! Your custom admin panel is now ready to use.
              </p>
              <p className="text-sm text-gray-400">
                You can now access all features and manage your business efficiently.
              </p>
            </div>
            <Button className="w-full bg-white text-black hover:bg-gray-200" onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </main>
      {/* Developer Credit */}
      <div className="py-8 border-t border-gray-800/50 bg-black/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <p className="text-center text-sm text-gray-400">
            Developed by{" "}
            <a
              href="https://bonusitsolutions.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors duration-300 font-medium hover:underline"
            >
              Bonus IT Solutions
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col min-h-screen bg-black">
          <Navbar />
          <main className="flex-1 py-20 px-4 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </main>
          {/* Developer Credit */}
          <div className="py-8 border-t border-gray-800/50 bg-black/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
              <p className="text-center text-sm text-gray-400">
                Developed by{" "}
                <a
                  href="https://bonusitsolutions.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors duration-300 font-medium hover:underline"
                >
                  Bonus IT Solutions
                </a>
              </p>
            </div>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
