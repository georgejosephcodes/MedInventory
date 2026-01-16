"use client"

import { useEffect, useState, useMemo, useContext } from "react"
import { getBatches, getMedicines } from "../lib/api"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../components/ui/card"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs"

import {
  Package,
  AlertTriangle,
  TrendingUp,
  Calendar,
} from "lucide-react"

import {
  Pie,
  PieChart,
  Cell,
  Label,
} from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import { formatDate, isExpiringSoon, isExpired } from "../lib/utils"
import { AuthContext } from "../context/AuthContext"

/* =========================
   DASHBOARD
========================= */
export default function Dashboard() {
  const { role, loading: authLoading } = useContext(AuthContext)

  const [batches, setBatches] = useState([])
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const [batchRes, medRes] = await Promise.all([
        getBatches(),
        getMedicines(),
      ])
      setBatches(batchRes.data.batches || [])
      setMedicines(medRes.data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const canViewInventoryValue = role === "ADMIN"

  /* =========================
     DERIVED DATA
  ========================= */
  const medicineMap = useMemo(() => {
    const map = {}
    medicines.forEach((m) => {
      map[m._id] = { ...m, totalQty: 0 }
    })
    batches.forEach((b) => {
      const m = b.medicineId
      if (!m || !map[m._id]) return
      map[m._id].totalQty += Number(b.quantity || 0)
    })
    return Object.values(map)
  }, [medicines, batches])

  const stats = useMemo(() => {
    const lowStockMeds = medicineMap.filter(
      (m) => m.totalQty < m.minStock
    )
    const expiringBatches = batches.filter((b) =>
      isExpiringSoon(b.expiryDate)
    )

    return {
      totalMedicines: medicineMap.filter((m) => m.totalQty > 0).length,
      lowStock: lowStockMeds.length,
      expiringSoon: expiringBatches.length,
      expired: batches.filter((b) => isExpired(b.expiryDate)).length,
      totalValue: batches.reduce(
        (s, b) => s + Number(b.quantity || 0) * Number(b.unitPrice),
        0
      ),
      lowStockMeds,
      expiringBatches,
    }
  }, [medicineMap, batches])

  /* =========================
     CHART DATA
  ========================= */
  const COLORS = {
    Good: "#22c55e",
    Low: "#f59e0b",
    Expiring: "#fb7185",
    Expired: "#ef4444",
  }

  const inventoryCategoryData = useMemo(() => {
    const map = {}
    const palette = ["#22c55e", "#3b82f6", "#f59e0b", "#8b5cf6"]
    let i = 0

    batches.forEach((b) => {
      const c = b.medicineId?.category || "Other"
      if (!map[c]) {
        map[c] = {
          name: c,
          value: 0,
          color: palette[i++ % palette.length],
        }
      }
      map[c].value += Number(b.quantity || 0)
    })

    return Object.values(map)
  }, [batches])

  const totalUnits = useMemo(() => {
    return inventoryCategoryData.reduce(
      (acc, curr) => acc + curr.value,
      0
    )
  }, [inventoryCategoryData])

  const stockHealthData = [
    { name: "Good", value: Math.max(batches.length - stats.lowStock - stats.expiringSoon - stats.expired, 0), fill: COLORS.Good },
    { name: "Low", value: stats.lowStock, fill: COLORS.Low },
    { name: "Expiring", value: stats.expiringSoon, fill: COLORS.Expiring },
    { name: "Expired", value: stats.expired, fill: COLORS.Expired },
  ]

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* DASHBOARD HEADING */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Inventory overview and health summary
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Medicines" value={stats.totalMedicines} icon={Package} color="text-indigo-500" />
        <StatCard title="Low Stock" value={stats.lowStock} icon={AlertTriangle} color="text-amber-500" />
        <StatCard title="Expiring Soon" value={stats.expiringSoon} icon={Calendar} color="text-rose-500" />
        {canViewInventoryValue && (
          <StatCard
            title="Inventory Value"
            value={`₹${Math.round(stats.totalValue).toLocaleString()}`}
            icon={TrendingUp}
            color="text-emerald-600"
          />
        )}
      </div>

      {/* CHARTS */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Inventory by Category */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>Inventory by Category</CardTitle>
            <CardDescription>Units distribution</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={{ value: { label: "Units" } }}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Pie
                  data={inventoryCategoryData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  strokeWidth={2}
                >
                  {inventoryCategoryData.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                            <tspan className="fill-foreground text-3xl font-bold">{totalUnits}</tspan>
                            <tspan x={viewBox.cx} dy={24} className="fill-muted-foreground text-sm">
                              Total Units
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Stock Health */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>Stock Health</CardTitle>
            <CardDescription>Overall condition</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={{ value: { label: "Count" } }}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Pie
                  data={stockHealthData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  strokeWidth={2}
                >
                  {stockHealthData.map((e, i) => (
                    <Cell key={i} fill={e.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* ALERTS */}
      <Card>
        <CardHeader>
          <CardTitle>Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="expiring">
            <TabsList>
              <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
              <TabsTrigger value="low">Low Stock</TabsTrigger>
            </TabsList>

            <TabsContent value="expiring" className="space-y-3 mt-4">
              {stats.expiringBatches.map((b) => (
                <div key={b._id} className="flex justify-between rounded-xl border p-3">
                  <div>
                    <p className="font-semibold">{b.medicineId?.name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {b.quantity}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(b.expiryDate)}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="low" className="space-y-3 mt-4">
              {stats.lowStockMeds.map((m) => (
                <div key={m._id} className="flex justify-between rounded-xl border p-3">
                  <div>
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Category: {m.category}
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-amber-600">
                    {m.totalQty} / {m.minStock}
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

/* =========================
   STAT CARD
========================= */
function StatCard({ title, value, icon: Icon, color }) {
  return (
    <Card>
      <CardHeader className="flex justify-between flex-row pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${color}`} />
      </CardHeader>
      <CardContent className="text-2xl font-bold">{value}</CardContent>
    </Card>
  )
}
