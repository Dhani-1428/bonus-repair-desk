"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useTranslation } from "@/components/language-provider"
import { useAuth } from "@/hooks/use-auth"
import { getUserData } from "@/lib/storage"
import { printReceiptForTickets } from "@/components/new-repair-ticket-form"

export default function DeviceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { t } = useTranslation()
  const { user } = useAuth()
  const [ticket, setTicket] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const printContentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadTicket = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        // Fetch all tickets for the user
        const response = await fetch(`/api/repairs?userId=${user.id}`)
        const data = await response.json()
        
        if (data.tickets) {
          const foundTicket = data.tickets.find((t: any) => t.id === params.id)
          
          if (foundTicket) {
            setTicket(foundTicket)
          } else {
            router.push("/tickets")
          }
        } else {
          router.push("/tickets")
        }
      } catch (error) {
        console.error("Error loading ticket:", error)
        router.push("/tickets")
      } finally {
        setLoading(false)
      }
    }

    loadTicket()
  }, [params.id, router, user?.id])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200"
      case "in_progress":
        return "bg-gray-700 text-white border border-gray-600"
      case "completed":
        return "bg-gray-800 text-white border border-gray-700"
      case "delivered":
        return "bg-gray-900 text-white border border-gray-800"
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200"
    }
  }

  const handlePrint = () => {
    if (typeof window !== "undefined" && ticket) {
      // Normalize the ticket data to match the expected structure
      const normalizedTicket = {
        ...ticket,
        // Ensure all fields exist with defaults if missing
        clientId: ticket.clientId || null,
        customerName: ticket.customerName || "N/A",
        contact: ticket.contact || "N/A",
        imeiNo: ticket.imeiNo || "000000000000000",
        brand: ticket.brand || "N/A",
        model: ticket.model || "N/A",
        serialNo: ticket.serialNo || null,
        softwareVersion: ticket.softwareVersion || null,
        warranty: ticket.warranty || "Without Warranty",
        battery: ticket.battery ?? false,
        charger: ticket.charger ?? false,
        simCard: ticket.simCard ?? false,
        memoryCard: ticket.memoryCard ?? false,
        loanEquipment: ticket.loanEquipment ?? false,
        equipmentObs: ticket.equipmentObs || null,
        repairObs: ticket.repairObs || null,
        selectedServices: ticket.selectedServices || (ticket.serviceName ? [ticket.serviceName] : []),
        condition: ticket.condition || null,
        problem: ticket.problem || "N/A",
        price: ticket.price || 0,
        repairNumber: ticket.repairNumber || "N/A",
        spu: ticket.spu || "N/A",
        createdAt: ticket.createdAt || new Date().toISOString(),
      }
      // Use the same print function as New Repair Device page
      printReceiptForTickets([normalizedTicket])
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-600">Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!ticket) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 text-white" ref={printContentRef}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-balance text-white">
              {t("page.tickets.title")}
            </h1>
            <p className="text-gray-300 text-balance">
              {t("page.tickets.subtitle")}
            </p>
          </div>
          <Button variant="outline" onClick={handlePrint} className="border-gray-700 bg-gray-900/50 text-white hover:bg-gray-800">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            {t("page.tickets.print")}
          </Button>
        </div>

        <Card className="shadow-2xl border border-gray-800/50 bg-gradient-to-br from-gray-900/95 via-black/95 to-gray-900/95 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-gray-800/50 rounded-t-lg px-6 py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-3 text-white">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {ticket.customerName?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div>
                  <div className="text-lg font-bold">{ticket.customerName || "N/A"}</div>
                  <div className="text-sm text-gray-300 font-normal">Repair #{ticket.repairNumber || "N/A"}</div>
            </div>
              </CardTitle>
              <Badge className={`${getStatusColor(ticket.status)} font-medium px-3 py-1`}>
                {ticket.status?.replace("_", " ").toUpperCase() || "PENDING"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Customer Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-400">Client's NIF</Label>
                    <p className="text-sm text-white">{ticket.clientId || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-400">Customer Name</Label>
                    <p className="text-sm text-white">{ticket.customerName || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-400">Client Phone</Label>
                    <p className="text-sm text-white">{ticket.contact || "N/A"}</p>
                  </div>
            </div>
          </div>

              {/* Device Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Device Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-400">Brand</Label>
                    <p className="text-sm text-white">{ticket.brand || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-400">Model</Label>
                    <p className="text-sm text-white">{ticket.model || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-400">IMEI</Label>
                    <p className="text-sm text-white font-mono">{ticket.imeiNo || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-400">Serial Number</Label>
                    <p className="text-sm text-white">{ticket.serialNo || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-400">Software Version</Label>
                    <p className="text-sm text-white">{ticket.softwareVersion || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-400">Warranty</Label>
                    <p className="text-sm text-white">{ticket.warranty || "Without Warranty"}</p>
            </div>
            </div>
          </div>

              {/* Repair Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Repair Details</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-400">Repair Number</Label>
                    <p className="text-sm text-white font-semibold">{ticket.repairNumber || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-400">SPU</Label>
                    <p className="text-sm text-white font-semibold">{ticket.spu || "N/A"}</p>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label className="text-xs text-gray-400">Services</Label>
                    <p className="text-sm text-white">
                      {Array.isArray(ticket.selectedServices) 
                        ? ticket.selectedServices.join(", ") 
                        : ticket.serviceName || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label className="text-xs text-gray-400">Problem / Technician Notes</Label>
                    <p className="text-sm text-white whitespace-pre-wrap">{ticket.problem || "N/A"}</p>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label className="text-xs text-gray-400">Condition</Label>
                    <p className="text-sm text-white whitespace-pre-wrap">{ticket.condition || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-400">Price</Label>
                    <p className="text-lg font-bold text-blue-400">€{Number.parseFloat(ticket.price || 0).toFixed(2)}</p>
                  </div>
                </div>
          </div>

              {/* Equipment Check */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Equipment Check</h3>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${ticket.battery ? "bg-green-500" : "bg-gray-600"}`}></div>
                    <span className="text-xs text-gray-400">Battery:</span>
                    <span className="text-sm text-white">{ticket.battery ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${ticket.charger ? "bg-green-500" : "bg-gray-600"}`}></div>
                    <span className="text-xs text-gray-400">Charger:</span>
                    <span className="text-sm text-white">{ticket.charger ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${ticket.simCard ? "bg-green-500" : "bg-gray-600"}`}></div>
                    <span className="text-xs text-gray-400">SIM Card:</span>
                    <span className="text-sm text-white">{ticket.simCard ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${ticket.memoryCard ? "bg-green-500" : "bg-gray-600"}`}></div>
                    <span className="text-xs text-gray-400">Memory Card:</span>
                    <span className="text-sm text-white">{ticket.memoryCard ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${ticket.loanEquipment ? "bg-green-500" : "bg-gray-600"}`}></div>
                    <span className="text-xs text-gray-400">Loan Equipment:</span>
                    <span className="text-sm text-white">{ticket.loanEquipment ? "Yes" : "No"}</span>
                  </div>
                </div>
          </div>

              {/* Observations */}
              {(ticket.equipmentObs || ticket.repairObs) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Observations</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {ticket.equipmentObs && (
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-400">Equipment Observations</Label>
                        <p className="text-sm text-white whitespace-pre-wrap">{ticket.equipmentObs}</p>
                      </div>
                    )}
                    {ticket.repairObs && (
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-400">Repair Observations</Label>
                        <p className="text-sm text-white whitespace-pre-wrap">{ticket.repairObs}</p>
                      </div>
                    )}
          </div>
          </div>
              )}

              {/* Timestamps */}
              <div className="pt-4 border-t border-gray-800">
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
                    <span>Created: {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : "N/A"}</span>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-400">Repair Number</Label>
                    <p className="text-sm text-white font-semibold">{ticket.repairNumber || "N/A"}</p>
                  </div>
                  {ticket.updatedAt && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Updated: {new Date(ticket.updatedAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
          </div>
        </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

