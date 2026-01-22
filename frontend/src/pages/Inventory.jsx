import { useEffect, useMemo, useState, useContext } from "react"
import { format } from "date-fns"
import { Search, CalendarIcon } from "lucide-react"

import {
  getMedicines,
  getBatchesByMedicine,
  stockIn,
} from "../lib/api"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"

import { Calendar } from "../components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover"

import { useToast } from "@/hooks/use-toast"
import { AuthContext } from "../context/AuthContext"

const STOCK_IN_STORAGE_KEY = "inventory_stock_in_form"

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
            {value ? format(new Date(value), "dd/MM/yyyy") : "Select date"}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value ? new Date(value) : undefined}
            onSelect={(date) => onChange(date ? date.toISOString() : "")}
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
   INVENTORY
========================= */
export default function Inventory() {
  const { toast } = useToast()
  const { role, loading } = useContext(AuthContext)

  const canViewBatches = role === "ADMIN" || role === "PHARMACIST"
  const canStockIn = role === "PHARMACIST"

  const [medicines, setMedicines] = useState([])
  const [search, setSearch] = useState("")
  const [medicineId, setMedicineId] = useState("")
  const [batches, setBatches] = useState([])

  // Stock IN
  const [batchNumber, setBatchNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [inQuantity, setInQuantity] = useState("")
  const [unitPrice, setUnitPrice] = useState("")
  const [supplier, setSupplier] = useState("")
  const [loadingAction, setLoadingAction] = useState(false)

  /* =========================
     SESSION DRAFT
  ========================= */
  useEffect(() => {
    const saved = sessionStorage.getItem(STOCK_IN_STORAGE_KEY)
    if (saved) {
      const d = JSON.parse(saved)
      setMedicineId(d.medicineId || "")
      setBatchNumber(d.batchNumber || "")
      setExpiryDate(d.expiryDate || "")
      setInQuantity(d.inQuantity || "")
      setUnitPrice(d.unitPrice || "")
      setSupplier(d.supplier || "")
    }
  }, [])

  useEffect(() => {
    if (!medicineId) return
    sessionStorage.setItem(
      STOCK_IN_STORAGE_KEY,
      JSON.stringify({
        medicineId,
        batchNumber,
        expiryDate,
        inQuantity,
        unitPrice,
        supplier,
      })
    )
  }, [medicineId, batchNumber, expiryDate, inQuantity, unitPrice, supplier])

  /* =========================
     LOAD MEDICINES
  ========================= */
  useEffect(() => {
    getMedicines()
      .then((res) => setMedicines(res.data.data || []))
      .catch(() =>
        toast({
          variant: "destructive",
          title: "Failed to load medicines",
        })
      )
  }, [])

  const filteredMedicines = useMemo(() => {
    if (!search) return []
    return medicines.filter((m) =>
      m.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [search, medicines])

  /* =========================
     LOAD BATCHES
  ========================= */
  useEffect(() => {
    if (!medicineId || !canViewBatches) return
    getBatchesByMedicine(medicineId)
      .then((res) => setBatches(res.data.batches || []))
      .catch(() =>
        toast({
          variant: "destructive",
          title: "Failed to load batches",
        })
      )
  }, [medicineId, canViewBatches])

  /* =========================
     STOCK IN
  ========================= */
  const handleStockIn = async (e) => {
    e.preventDefault()
    if (!canStockIn) return

    if (
      !batchNumber.trim() ||
      !expiryDate ||
      Number(inQuantity) <= 0 ||
      Number(unitPrice) <= 0 ||
      !supplier.trim()
    ) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "All fields are required",
      })
      return
    }

    setLoadingAction(true)
    try {
      await stockIn({
        medicineId,
        batchNumber,
        expiryDate,
        quantity: Number(inQuantity),
        unitPrice: Number(unitPrice),
        supplier,
      })

      toast({ title: "Stock added successfully" })

      sessionStorage.removeItem(STOCK_IN_STORAGE_KEY)
      setBatchNumber("")
      setExpiryDate("")
      setInQuantity("")
      setUnitPrice("")
      setSupplier("")
      setBatches([])
      setMedicineId("")
    } catch {
      toast({
        variant: "destructive",
        title: "Stock in failed",
      })
    } finally {
      setLoadingAction(false)
    }
  }

  if (loading) return null

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Inventory</h1>

      {/* SELECT MEDICINE */}
      <Card>
        <CardHeader>
          <CardTitle>Select Medicine</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="h-9 pl-9 text-sm"
              placeholder="Search medicine"
              value={
                medicineId
                  ? medicines.find((m) => m._id === medicineId)?.name || ""
                  : search
              }
              onChange={(e) => {
                setMedicineId("")
                setSearch(e.target.value)
              }}
            />

            {search && filteredMedicines.length > 0 && (
              <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border bg-background shadow">
                {filteredMedicines.map((m) => (
                  <div
                    key={m._id}
                    className="cursor-pointer px-3 py-2 text-sm hover:bg-accent"
                    onClick={() => {
                      setMedicineId(m._id)
                      setSearch("")
                    }}
                  >
                    {m.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* STOCK IN */}
      {medicineId && canStockIn && (
        <Card>
          <CardHeader>
            <CardTitle>Stock In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStockIn} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Batch Number</Label>
                <Input value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} />
              </div>

              <DatePicker label="Expiry Date" value={expiryDate} onChange={setExpiryDate} />

              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" min="1" value={inQuantity} onChange={(e) => setInQuantity(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Unit Price (₹)</Label>
                <Input type="number" step="any" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Supplier</Label>
                <Input value={supplier} onChange={(e) => setSupplier(e.target.value)} />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" disabled={loadingAction}>
                  Add Stock
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* BATCHES */}
      {medicineId && canViewBatches && (
        <Card>
          <CardHeader>
            <CardTitle>Active Batches</CardTitle>
          </CardHeader>
          <CardContent>
            {batches.length === 0 ? (
              <p className="text-muted-foreground">No active batches</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Expiry</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((b) => (
                    <TableRow key={b._id}>
                      <TableCell>{b.batchNumber}</TableCell>
                      <TableCell>{b.quantity}</TableCell>
                      <TableCell>₹{b.unitPrice}</TableCell>
                      <TableCell>{format(new Date(b.expiryDate), "dd/MM/yyyy")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
