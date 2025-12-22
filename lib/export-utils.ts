/**
 * Export utilities for generating CSV and other file formats
 */

export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers: { key: keyof T; label: string }[]
) {
  if (data.length === 0) {
    alert("No data to export")
    return
  }

  // Create CSV header
  const csvHeaders = headers.map((h) => h.label).join(",")

  // Create CSV rows
  const csvRows = data.map((item) => {
    return headers
      .map((header) => {
        const value = item[header.key]
        // Handle values that might contain commas or quotes
        if (value === null || value === undefined) return ""
        const stringValue = String(value)
        if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      })
      .join(",")
  })

  // Combine headers and rows
  const csvContent = [csvHeaders, ...csvRows].join("\n")

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportOrdersToCSV(orders: any[]) {
  const headers = [
    { key: "id" as const, label: "Order ID" },
    { key: "customerName" as const, label: "Customer" },
    { key: "total" as const, label: "Total (€)" },
    { key: "status" as const, label: "Status" },
    { key: "createdAt" as const, label: "Date" },
  ]

  const formattedOrders = orders.map((order) => ({
    id: order.id.slice(-6),
    customerName: order.customerName,
    total: order.total.toFixed(2),
    status: order.status,
    createdAt: new Date(order.createdAt).toLocaleString(),
  }))

  exportToCSV(formattedOrders, "orders", headers)
}

export function exportCustomersToCSV(customers: any[]) {
  const headers = [
    { key: "name" as const, label: "Name" },
    { key: "email" as const, label: "Email" },
    { key: "phone" as const, label: "Phone" },
    { key: "address" as const, label: "Address" },
    { key: "createdAt" as const, label: "Date Added" },
  ]

  const formattedCustomers = customers.map((customer) => ({
    name: customer.name,
    email: customer.email,
    phone: customer.phone || "",
    address: customer.address || "",
    createdAt: new Date(customer.createdAt).toLocaleString(),
  }))

  exportToCSV(formattedCustomers, "customers", headers)
}

export function exportProductsToCSV(products: any[]) {
  const headers = [
    { key: "name" as const, label: "Product Name" },
    { key: "price" as const, label: "Price (€)" },
    { key: "stock" as const, label: "Stock" },
    { key: "description" as const, label: "Description" },
    { key: "createdAt" as const, label: "Date Added" },
  ]

  const formattedProducts = products.map((product) => ({
    name: product.name,
    price: product.price.toFixed(2),
    stock: product.stock,
    description: product.description || "",
    createdAt: new Date(product.createdAt).toLocaleString(),
  }))

  exportToCSV(formattedProducts, "products", headers)
}

