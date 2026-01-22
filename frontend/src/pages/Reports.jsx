import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Download } from "lucide-react"

import {
  getMonthlyUsage,
  getTopConsumed,
  getExpiredWastage,
} from "../lib/api"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Label } from "../components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs"

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label as RechartLabel,
} from "recharts"

import { Calendar } from "../components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover"
import { useToast } from "@/hooks/use-toast"

/* =========================
   COLOR PALETTE
========================= */
const COLORS = [
  "#60a5fa",
  "#34d399",
  "#fbbf24",
  "#f87171",
  "#a78bfa",
  "#2dd4bf",
  "#fb7185",
  "#818cf8",
]

/* =========================
   CSV HELPERS
========================= */
const csvEscape = (v) =>
  `"${String(v ?? "").replace(/"/g, '""')}"`

const exportReportsCSV = (data, type) => {
  if (!data.length) return

  const headers = [
    "Medicine Name",
    "Quantity",
    "Total Cost",
    "Report Type",
  ]

  const rows = data.map((i) =>
    [
      csvEscape(i.medicine || i.name),
      csvEscape(i.totalUsed ?? i.wastedQty),
      csvEscape(i.totalCost ?? 0),
      csvEscape(type),
    ].join(",")
  )

  const csv = [headers.join(","), ...rows].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = `reports_${type}_${Date.now()}.csv`
  a.click()

  URL.revokeObjectURL(url)
}

/* =========================
   DATE PICKER
========================= */
function DatePicker({ label, value, onChange }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            {value ? format(value, "dd/MM/yyyy") : "Select date"}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default function Reports() {
  const { toast } = useToast()

  const today = new Date()
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  const [from, setFrom] = useState(monthStart)
  const [to, setTo] = useState(today)

  const [usage, setUsage] = useState([])
  const [top, setTop] = useState([])
  const [expired, setExpired] = useState([])
  const [loading, setLoading] = useState(false)

  /* =========================
     FETCH REPORTS
  ========================= */
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true)
      try {
        const [u, t, e] = await Promise.all([
          getMonthlyUsage({ from: from.toISOString(), to: to.toISOString() }),
          getTopConsumed({ from: from.toISOString(), to: to.toISOString() }),
          getExpiredWastage({ from: from.toISOString(), to: to.toISOString() }),
        ])

        setUsage(u.data.data || [])
        setTop(t.data.data || [])
        setExpired(e.data.data || [])
      } catch {
        toast({
          variant: "destructive",
          title: "Failed to load reports",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [from, to])

  /* =========================
     TOTALS
  ========================= */
  const calcTotals = (data, qtyKey) => ({
    units: data.reduce((s, i) => s + (i[qtyKey] || 0), 0),
    cost: data.reduce((s, i) => s + (i.totalCost || 0), 0),
  })

  const usageTotals = useMemo(() => calcTotals(usage, "totalUsed"), [usage])
  const topTotals = useMemo(() => calcTotals(top, "totalUsed"), [top])
  const expiredTotals = useMemo(
    () => calcTotals(expired, "wastedQty"),
    [expired]
  )

  /* =========================
     COLOR MAP
  ========================= */
  const colorMap = useMemo(() => {
    const map = {}
    let i = 0
    ;[...usage, ...top, ...expired].forEach((item) => {
      const key = item.medicine || item.name
      if (!map[key]) map[key] = COLORS[i++ % COLORS.length]
    })
    return map
  }, [usage, top, expired])

  /* =========================
     DONUT
  ========================= */
  const Donut = ({ data, dataKey, nameKey, totals }) => {
    if (loading) {
      return (
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          Loading…
        </div>
      )
    }

    if (!data.length) {
      return (
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          No data available
        </div>
      )
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            innerRadius={72}
            outerRadius={110}
            stroke="transparent"
          >
            {data.map((i, idx) => (
              <Cell
                key={idx}
                fill={colorMap[i[nameKey] || i.medicine]}
              />
            ))}
            <RechartLabel
              content={({ viewBox }) => (
                <text
                  x={viewBox.cx}
                  y={viewBox.cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  <tspan className="fill-foreground text-lg font-semibold">
                    {totals.units} units
                  </tspan>
                  <tspan
                    x={viewBox.cx}
                    dy={20}
                    className="fill-muted-foreground text-sm"
                  >
                    ₹{totals.cost.toFixed(2)}
                  </tspan>
                </text>
              )}
            />
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            Analytics based on selected date range
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() =>
            exportReportsCSV(usage, "usage")
          }
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
        <DatePicker label="Start Date" value={from} onChange={setFrom} />
        <DatePicker label="End Date" value={to} onChange={setTo} />
      </div>

      <Tabs defaultValue="usage">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="top">Top Consumed</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
        </TabsList>

        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>Usage Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <Donut
                data={usage}
                dataKey="totalUsed"
                nameKey="medicine"
                totals={usageTotals}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top">
          <Card>
            <CardHeader>
              <CardTitle>Top Consumed</CardTitle>
            </CardHeader>
            <CardContent>
              <Donut
                data={top}
                dataKey="totalUsed"
                nameKey="name"
                totals={topTotals}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expired">
          <Card>
            <CardHeader>
              <CardTitle>Expired / Wastage</CardTitle>
            </CardHeader>
            <CardContent>
              <Donut
                data={expired}
                dataKey="wastedQty"
                nameKey="name"
                totals={expiredTotals}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
