import { useEffect, useMemo, useState, useContext } from "react";
import {
  getMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} from "../lib/api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Search } from "lucide-react";

import MedicineList from "../components/medicines/MedicineList";
import MedicineForm from "../components/medicines/MedicineForm";
import { useToast } from "@/hooks/use-toast";
import { AuthContext } from "../context/AuthContext";

export default function Medicines() {
  const { toast } = useToast();
  const { role, loading } = useContext(AuthContext);

  const canModify = role === "ADMIN";

  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    minStock: "",
    description: "",
  });

  /* =========================
     LOAD MEDICINES
  ========================= */
  const loadMedicines = async () => {
    try {
      const res = await getMedicines();
      setMedicines(res.data.data || []);
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to load medicines",
      });
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  /* =========================
     SEARCH
  ========================= */
  const filteredMedicines = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return medicines;

    return medicines.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.category?.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q)
    );
  }, [search, medicines]);

  /* =========================
     RESET FORM
  ========================= */
  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      minStock: "",
      description: "",
    });
    setEditing(null);
  };

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canModify) return;

    if (!formData.name.trim() || !formData.category.trim()) {
      toast({
        variant: "destructive",
        title: "Validation error",
        description: "Name and category are required",
      });
      return;
    }

    const payload = {
      name: formData.name.trim(),
      category: formData.category.trim(),
      description: formData.description || undefined,
      minStock:
        formData.minStock !== "" ? Number(formData.minStock) : undefined,
    };

    setLoadingAction(true);

    try {
      if (editing) {
        await updateMedicine(editing._id, payload);
        toast({ title: "Medicine updated" });
      } else {
        await createMedicine(payload);
        toast({ title: "Medicine added" });
      }

      setOpen(false);
      resetForm();
      loadMedicines();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Operation failed",
        description:
          err.response?.data?.message || "Something went wrong",
      });
    } finally {
      setLoadingAction(false);
    }
  };

  /* =========================
     EDIT / DELETE
  ========================= */
  const handleEdit = (med) => {
    if (!canModify) return;

    setEditing(med);
    setFormData({
      name: med.name || "",
      category: med.category || "",
      minStock: med.minStock ?? "",
      description: med.description || "",
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!canModify) return;
    if (!confirm("Delete this medicine?")) return;

    try {
      await deleteMedicine(id);
      toast({ title: "Medicine deleted" });
      loadMedicines();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Delete failed",
      });
    }
  };

  /* =========================
     RENDER GUARD
  ========================= */
  if (loading) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Medicines</h1>

        {canModify && (
          <Button onClick={() => setOpen(true)}>Add Medicine</Button>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label>Search</Label>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="h-9 pl-9 text-sm"
                placeholder="Search by name, category or description"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Medicine List</CardTitle>
        </CardHeader>
        <CardContent>
          <MedicineList
            medicines={filteredMedicines}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canModify={canModify}
          />
        </CardContent>
      </Card>

      {canModify && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Medicine" : "Add Medicine"}
              </DialogTitle>
            </DialogHeader>

            <MedicineForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              onCancel={() => {
                setOpen(false);
                resetForm();
              }}
              isEditing={Boolean(editing)}
              loading={loadingAction}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
