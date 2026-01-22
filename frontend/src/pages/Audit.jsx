import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Search, CalendarIcon, Download } from "lucide-react"

import { getMedicines, getStockLogs } from "../lib/api"

import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Button } from "../components/ui/button"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../components/ui/dropdown-menu"

import { Calendar } from "../components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover"

import AuditLogs from "../components/audit/AuditLogs"

/* =========================
   ACTION NORMALIZER
========================= */
const normalizeAction = (action = "") => {
  const a = action.toLowerCase()
  if (a.includes("in")) return "IN"
  if (a.includes("out")) return "OUT"
  if (a.includes("expire")) return "EXPIRED"
  return "UNKNOWN"
}

/* =========================
   CSV EXPORT
========================= */
const csvEscape = (v) =>
  `"${String(v ?? "").replace(/"/g, '""')}"`

const exportAuditCSV = (logs) => {
  if (!logs.length) return

  const headers = [
    "Date",
    "Action",
    "Medicine Name",
    "Medicine ID",
    "Batch Number",
    "Batch ID",
    "Quantity",
    "Unit Price",
    "Total Value",
    "Performed By",
    "User Role",
    "Note",
    "IP Address",
  ]

  const rows = logs.map((log) => {
    const qty = Number(log.quantity || 0)
    const price = Number(log.unitPrice || 0)

    return [
      csvEscape(format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")),
      csvEscape(normalizeAction(log.action)),
      csvEscape(log.medicineId?.name),
      csvEscape(log.medicineId?._id),
      csvEscape(log.batchId?.batchNumber),
      csvEscape(log.batchId?._id),
      csvEscape(qty),
      csvEscape(price || ""),
      csvEscape(price ? qty * price : ""),
      csvEscape(log.performedBy?.name),
      csvEscape(log.performedBy?.role),
      csvEscape(log.note),
      csvEscape(log.ipAddress),
    ].join(",")
  })

  const csv = [headers.join(","), ...rows].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = `audit_logs_${Date.now()}.csv`
  a.click()

  URL.revokeObjectURL(url)
}

/* =========================
   DATE PICKER
========================= */
function DatePicker({ label, value, onChange, minDate }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-left">
            {value ? format(new Date(value), "MM/dd/yyyy") : "mm/dd/yyyy"}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value ? new Date(value) : undefined}
            fromDate={minDate ? new Date(minDate) : undefined}
            onSelect={(d) => onChange(d ? d.toISOString() : "")}
            captionLayout="dropdown"
            fromYear={2000}
            toYear={2035}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

/* =========================
   AUDIT PAGE
========================= */
export default function Audit() {
  const [logs, setLogs] = useState([])
  const [filteredLogs, setFilteredLogs] = useState([])
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [filters, setFilters] = useState({
    search: "",
    medicineId: "",
    startDate: "",
    endDate: "",
  })

  /* LOAD MEDICINES */
  useEffect(() => {
    getMedicines()
      .then((res) => setMedicines(res.data.data || []))
      .catch(() => setError("Failed to load medicines"))
  }, [])

  /* LOAD LOGS */
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true)

        const hasDate = filters.startDate || filters.endDate

        const res = await getStockLogs({
          medicineId: filters.medicineId || undefined,
          from: filters.startDate || undefined,
          to: filters.endDate || undefined,
          ...(hasDate ? {} : { limit: 20 }),
        })

        setLogs(res.data.data || [])
        setFilteredLogs(res.data.data || [])
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load audit logs")
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [filters.medicineId, filters.startDate, filters.endDate])

  /* SEARCH */
  useEffect(() => {
    const q = filters.search.trim().toLowerCase()
    if (!q) {
      setFilteredLogs(logs)
      return
    }

    setFilteredLogs(
      logs.filter((log) => {
        const action = normalizeAction(log.action)
        if (["in", "out", "expired"].includes(q))
          return action === q.toUpperCase()

        return (
          log.medicineId?.name?.toLowerCase().includes(q) ||
          log.batchId?.batchNumber?.toLowerCase().includes(q) ||
          log.performedBy?.name?.toLowerCase().includes(q)
        )
      })
    )
  }, [filters.search, logs])

  if (loading) {
    return (
      <div className="flex justify-center h-64">
        <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Audit Logs</h1>

        <Button
          variant="outline"
          onClick={() => exportAuditCSV(filteredLogs)}
          disabled={!filteredLogs.length}
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {/* FILTERS */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* SEARCH */}
          <div className="space-y-2">
            <Label>Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="medicine, batch, user, in/out/expired"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
            </div>
          </div>

          {/* MEDICINE */}
          <div className="space-y-2">
            <Label>Medicine</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-10 w-full rounded-md border border-input bg-background px-3 text-left text-sm">
                  {filters.medicineId
                    ? medicines.find((m) => m._id === filters.medicineId)?.name
                    : "All medicines"}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-64 overflow-y-auto">
                <DropdownMenuItem
                  onClick={() =>
                    setFilters({ ...filters, medicineId: "" })
                  }
                >
                  All medicines
                </DropdownMenuItem>
                {medicines.map((m) => (
                  <DropdownMenuItem
                    key={m._id}
                    onClick={() =>
                      setFilters({ ...filters, medicineId: m._id })
                    }
                  >
                    {m.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <DatePicker
            label="Start Date"
            value={filters.startDate}
            onChange={(v) =>
              setFilters({ ...filters, startDate: v })
            }
          />

          <DatePicker
            label="End Date"
            value={filters.endDate}
            onChange={(v) =>
              setFilters({ ...filters, endDate: v })
            }
            minDate={filters.startDate}
          />
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card>
        <CardContent className="p-0">
          <AuditLogs logs={filteredLogs} />
        </CardContent>
      </Card>
    </div>
  )
}
