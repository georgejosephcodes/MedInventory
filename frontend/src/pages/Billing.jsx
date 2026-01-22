import { useEffect, useMemo, useRef, useState } from "react"
import { Pencil, Trash2, Search } from "lucide-react"

import {
  getMedicines,
  getBatchesByMedicine,
  stockOut,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog"

import { useToast } from "@/hooks/use-toast"

const BILLING_STORAGE_KEY = "billing_session_state"

export default function Billing() {
  const { toast } = useToast()
  const dropdownRef = useRef(null)

  const [medicines, setMedicines] = useState([])
  const [search, setSearch] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedMedicine, setSelectedMedicine] = useState(null)
  const [quantity, setQuantity] = useState("")

  const [cart, setCart] = useState([]) // batch-level cart
  const [editingId, setEditingId] = useState(null)
  const [editQty, setEditQty] = useState("")

  const [patientId, setPatientId] = useState("")
  const [gstRate, setGstRate] = useState(5)

  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  /* =========================
     CLOSE DROPDOWN
  ========================= */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  /* =========================
     SESSION RESTORE
  ========================= */
  useEffect(() => {
    const saved = sessionStorage.getItem(BILLING_STORAGE_KEY)
    if (saved) {
      const data = JSON.parse(saved)
      setCart(data.cart || [])
      setPatientId(data.patientId || "")
      setGstRate(data.gstRate ?? 5)
    }
  }, [])

  useEffect(() => {
    sessionStorage.setItem(
      BILLING_STORAGE_KEY,
      JSON.stringify({ cart, patientId, gstRate })
    )
  }, [cart, patientId, gstRate])

  /* =========================
     LOAD MEDICINES
  ========================= */
  useEffect(() => {
    getMedicines().then((res) =>
      setMedicines(res.data.data || [])
    )
  }, [])

  const filteredMedicines = useMemo(() => {
    if (!search) return []
    return medicines.filter((m) =>
      m.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [search, medicines])

  /* =========================
     ADD MEDICINE (FEFO)
  ========================= */
  const handleAdd = async () => {
    if (!selectedMedicine || quantity <= 0) return

    const res = await getBatchesByMedicine(selectedMedicine._id)
    const batches = res.data.batches || []

    let remaining = Number(quantity)
    const newLines = []

    for (const b of batches) {
      if (remaining <= 0) break
      if (b.quantity <= 0) continue

      const used = Math.min(remaining, b.quantity)
      remaining -= used

      newLines.push({
        id: `${b._id}-${Date.now()}`,
        medicineId: selectedMedicine._id,
        medicineName: selectedMedicine.name,
        batchId: b._id,
        batchNumber: b.batchNumber,
        unitPrice: b.unitPrice,
        quantity: used,
      })
    }

    if (remaining > 0) {
      toast({
        variant: "destructive",
        title: "Insufficient stock",
      })
      return
    }

    setCart((prev) => [...prev, ...newLines])
    setSearch("")
    setQuantity("")
    setSelectedMedicine(null)
    setShowDropdown(false)
  }

  /* =========================
     TOTALS
  ========================= */
  const totals = useMemo(() => {
    return cart.map((c) => {
      const base = c.quantity * c.unitPrice
      const gst = base * (gstRate / 100)
      return {
        ...c,
        base,
        gst,
        total: base + gst,
      }
    })
  }, [cart, gstRate])

  const grandTotal = totals.reduce((s, i) => s + i.total, 0)

  /* =========================
     ISSUE STOCK
  ========================= */
  const issueStock = async () => {
    setLoading(true)
    setConfirmOpen(false)

    try {
      for (const line of cart) {
        await stockOut({
          medicineId: line.medicineId,
          batchId: line.batchId,
          quantity: line.quantity,
          note: `Patient ID: ${patientId}`,
        })
      }

      toast({
        title: "Stock Issued",
        description: `₹${grandTotal.toFixed(2)}`,
      })

      sessionStorage.removeItem(BILLING_STORAGE_KEY)
      setCart([])
      setPatientId("")
    } catch {
      toast({ variant: "destructive", title: "Stock issue failed" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <h1 className="text-3xl font-bold">Billing & Dispensing</h1>

      {/* PATIENT */}
      <Card>
        <CardContent className="flex gap-6 pt-6">
          <div className="w-1/3">
            <Label>Patient ID</Label>
            <Input value={patientId} onChange={(e) => setPatientId(e.target.value)} />
          </div>
          <div className="w-24">
            <Label>GST %</Label>
            <Input type="number" value={gstRate} onChange={(e) => setGstRate(+e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* ADD MEDICINE */}
      <Card>
        <CardHeader><CardTitle>Add Medicine</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-3 gap-4 items-end" ref={dropdownRef}>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search medicine"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setShowDropdown(true)
              }}
            />
            {showDropdown && search && (
              <div className="absolute z-10 w-full border bg-background rounded shadow">
                {filteredMedicines.map((m) => (
                  <div
                    key={m._id}
                    className="px-3 py-2 hover:bg-accent cursor-pointer"
                    onClick={() => {
                      setSelectedMedicine(m)
                      setSearch(m.name)
                      setShowDropdown(false)
                    }}
                  >
                    {m.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Input
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          <Button size="sm" onClick={handleAdd}>Add</Button>
        </CardContent>
      </Card>

      {/* BILL TABLE */}
      <Card>
        <CardHeader><CardTitle>Bill Details</CardTitle></CardHeader>
        <CardContent>
          {totals.length === 0 ? (
            <p className="text-muted-foreground">No medicines added</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>GST</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {totals.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.medicineName}</TableCell>
                    <TableCell>{c.batchNumber}</TableCell>
                    <TableCell>{c.quantity}</TableCell>
                    <TableCell>₹{c.unitPrice}</TableCell>
                    <TableCell>₹{c.gst.toFixed(2)}</TableCell>
                    <TableCell>₹{c.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Trash2
                        className="h-4 w-4 text-red-500 cursor-pointer"
                        onClick={() =>
                          setCart((prev) =>
                            prev.filter((i) => i.id !== c.id)
                          )
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* GRAND TOTAL */}
      <Card>
        <CardContent className="flex justify-between py-4">
          <span className="text-lg font-semibold">Grand Total</span>
          <span className="text-xl font-bold">₹{grandTotal.toFixed(2)}</span>
        </CardContent>
      </Card>

      {/* ACTION */}
      <div className="flex justify-end">
        <Button
          disabled={!cart.length || !patientId || loading}
          onClick={() => setConfirmOpen(true)}
        >
          Issue Stock
        </Button>
      </div>

      {/* CONFIRM */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Issue</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Issue medicines worth ₹{grandTotal.toFixed(2)}?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={issueStock}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
