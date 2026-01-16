import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, Search } from "lucide-react";

import {
  getMedicines,
  getBatchesByMedicine,
  stockOut,
} from "../lib/api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

import { useToast } from "@/hooks/use-toast";

/* =========================
   BILLING
========================= */
export default function Billing() {
  const { toast } = useToast();

  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [quantity, setQuantity] = useState("");

  const [cart, setCart] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editQty, setEditQty] = useState("");

  const [patientId, setPatientId] = useState("");
  const [gstRate, setGstRate] = useState(5);

  const [loading, setLoading] = useState(false);

  /* =========================
     LOAD MEDICINES
  ========================= */
  useEffect(() => {
    getMedicines().then((res) =>
      setMedicines(res.data.data || [])
    );
  }, []);

  const filteredMedicines = useMemo(() => {
    if (!search) return [];
    return medicines.filter((m) =>
      m.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, medicines]);

  /* =========================
     VALIDATE STOCK
  ========================= */
  const validateStock = async (medicineId, qty) => {
    const res = await getBatchesByMedicine(medicineId);
    const available = res.data.batches.reduce(
      (s, b) => s + b.quantity,
      0
    );
    return qty <= available;
  };

  /* =========================
     ADD MEDICINE
  ========================= */
  const handleAdd = async () => {
    if (!selectedMedicine || quantity <= 0) return;

    const existing = cart.find(
      (c) => c.medicineId === selectedMedicine._id
    );

    const finalQty =
      Number(quantity) + (existing?.quantity || 0);

    const ok = await validateStock(
      selectedMedicine._id,
      finalQty
    );

    if (!ok) {
      toast({
        variant: "destructive",
        title: "Insufficient stock",
      });
      return;
    }

    setCart((prev) => {
      if (existing) {
        return prev.map((c) =>
          c.medicineId === selectedMedicine._id
            ? { ...c, quantity: finalQty }
            : c
        );
      }
      return [
        ...prev,
        {
          medicineId: selectedMedicine._id,
          name: selectedMedicine.name,
          quantity: Number(quantity),
          unitPrice: 100,
        },
      ];
    });

    setSearch("");
    setQuantity("");
    setSelectedMedicine(null);
    setShowDropdown(false);
  };

  /* =========================
     SAVE EDIT
  ========================= */
  const saveEdit = async (item) => {
    if (editQty <= 0) return;

    const ok = await validateStock(item.medicineId, editQty);
    if (!ok) {
      toast({
        variant: "destructive",
        title: "Insufficient stock",
      });
      return;
    }

    setCart((prev) =>
      prev.map((c) =>
        c.medicineId === item.medicineId
          ? { ...c, quantity: Number(editQty) }
          : c
      )
    );

    setEditingId(null);
    setEditQty("");
  };

  /* =========================
     TOTALS
  ========================= */
  const subtotal = useMemo(
    () =>
      cart.reduce(
        (s, i) => s + i.quantity * i.unitPrice,
        0
      ),
    [cart]
  );

  const gstAmount = subtotal * (gstRate / 100);
  const grandTotal = subtotal + gstAmount;

  /* =========================
     ISSUE STOCK
  ========================= */
  const handleIssueStock = async () => {
    if (!patientId.trim()) {
      toast({
        variant: "destructive",
        title: "Patient ID required",
      });
      return;
    }

    if (!cart.length) {
      toast({
        variant: "destructive",
        title: "No medicines added",
      });
      return;
    }

    setLoading(true);
    try {
      for (const item of cart) {
        await stockOut({
          medicineId: item.medicineId,
          quantity: item.quantity,
          note: `Patient ID: ${patientId}`,
        });
      }

      toast({
        title: "Stock Issued Successfully",
        description: `Total ₹${grandTotal.toFixed(2)}`,
      });

      setCart([]);
      setPatientId("");
    } catch {
      toast({
        variant: "destructive",
        title: "Stock issue failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBill = () => {
    if (!cart.length) {
      toast({
        variant: "destructive",
        title: "No items to bill",
      });
      return;
    }

    toast({
      title: "Bill Generated",
      description: `Grand Total ₹${grandTotal.toFixed(2)}`,
      className: "bg-green-600 text-white",
    });
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">
          MedInventory Pharmacy
        </h1>
        <p className="text-muted-foreground">
          Billing & Dispensing
        </p>
      </div>

      {/* PATIENT */}
      <Card>
        <CardContent className="flex gap-6 pt-6">
          <div className="w-1/3">
            <Label>Patient ID</Label>
            <Input
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
            />
          </div>
          <div className="w-24">
            <Label>GST %</Label>
            <Input
              type="number"
              value={gstRate}
              onChange={(e) => setGstRate(Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      {/* ADD MEDICINE */}
      <Card>
        <CardHeader>
          <CardTitle>Add Medicine</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4 items-end">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search medicine"
              value={search}
              onFocus={() => setShowDropdown(true)}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowDropdown(true);
              }}
            />

            {showDropdown && search && (
              <div className="absolute z-10 w-full border bg-background rounded shadow">
                {filteredMedicines.map((m) => (
                  <div
                    key={m._id}
                    className="px-3 py-2 hover:bg-accent cursor-pointer"
                    onClick={() => {
                      setSelectedMedicine(m);
                      setSearch(m.name);
                      setShowDropdown(false);
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

          <div className="flex justify-end">
            <Button size="sm" onClick={handleAdd}>
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* BILL */}
      <Card>
        <CardHeader>
          <CardTitle>Bill</CardTitle>
        </CardHeader>
        <CardContent>
          {cart.length === 0 ? (
            <p className="text-muted-foreground">
              No medicines added
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine</TableHead>
                  <TableHead className="w-20">Qty</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="w-20">GST</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.map((c) => {
                  const line = c.quantity * c.unitPrice;
                  const gst = line * (gstRate / 100);
                  return (
                    <TableRow key={c.medicineId}>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>
                        {editingId === c.medicineId ? (
                          <Input
                            type="number"
                            className="w-20"
                            value={editQty}
                            onChange={(e) =>
                              setEditQty(e.target.value)
                            }
                          />
                        ) : (
                          c.quantity
                        )}
                      </TableCell>
                      <TableCell>₹{c.unitPrice}</TableCell>
                      <TableCell className="text-right">
                        ₹{gst.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        ₹{(line + gst).toFixed(2)}
                      </TableCell>
                      <TableCell className="flex gap-4">
                        {editingId === c.medicineId ? (
                          <Button
                            size="sm"
                            onClick={() => saveEdit(c)}
                          >
                            Save
                          </Button>
                        ) : (
                          <Pencil
                            className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              setEditingId(c.medicineId);
                              setEditQty(c.quantity);
                            }}
                          />
                        )}
                        <Trash2
                          className="h-4 w-4 cursor-pointer text-red-500 hover:text-red-600"
                          onClick={() =>
                            setCart((prev) =>
                              prev.filter(
                                (i) =>
                                  i.medicineId !==
                                  c.medicineId
                              )
                            )
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* GRAND TOTAL */}
      <Card>
        <CardContent className="flex justify-between items-center py-4">
          <span className="text-lg font-semibold">
            Grand Total
          </span>
          <span className="text-xl font-bold">
            ₹{grandTotal.toFixed(2)}
          </span>
        </CardContent>
      </Card>

      {/* ACTIONS */}
      <div className="flex justify-end gap-4">
        <Button
          className="bg-green-600 hover:bg-green-700 text-white h-11"
          onClick={handleGenerateBill}
        >
          Generate Bill
        </Button>
        <Button
          className="h-11"
          disabled={loading}
          onClick={handleIssueStock}
        >
          Issue Stock
        </Button>
      </div>
    </div>
  );
}
