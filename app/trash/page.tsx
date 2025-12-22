"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { TrashDevices } from "@/components/trash-devices"

export default function TrashPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 text-white">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance text-white">
            Trash
          </h1>
          <p className="text-gray-300 text-balance">Deleted devices - Restore or permanently delete</p>
        </div>
        <TrashDevices />
      </div>
    </DashboardLayout>
  )
}

