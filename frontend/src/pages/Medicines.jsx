import { useEffect, useMemo, useState, useContext } from "react"
import {
  getMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} from "../lib/api"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import { Button } from "../components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Search } from "lucide-react"

import MedicineList from "../components/medicines/MedicineList"
import MedicineForm from "../components/medicines/MedicineForm"
import { useToast } from "@/hooks/use-toast"
import { AuthContext } from "../context/AuthContext"

export default function Medicines() {
  const { toast } = useToast()
  const { role, loading } = useContext(AuthContext)

  const canModify = role === "ADMIN"

  const [medicines, setMedicines] = useState([])
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [loadingAction, setLoadingAction] = useState(false)

  // delete dialog state
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    minStock: "",
    description: "",
  })

  /* =========================
     LOAD MEDICINES
  ========================= */
  const loadMedicines = async () => {
    try {
      const res = await getMedicines()
      setMedicines(res.data.data || [])
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to load medicines",
      })
    }
  }

  useEffect(() => {
    loadMedicines()
  }, [])

  /* =========================
     SEARCH
  ========================= */
  const filteredMedicines = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return medicines

    return medicines.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.category?.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q)
    )
  }, [search, medicines])

  /* =========================
     RESET FORM
  ========================= */
  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      minStock: "",
      description: "",
    })
    setEditing(null)
  }

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canModify) return

    if (!formData.name.trim() || !formData.category.trim()) {
      toast({
        variant: "destructive",
        title: "Validation error",
        description: "Name and category are required",
      })
      return
    }

    const payload = {
      name: formData.name.trim(),
      category: formData.category.trim(),
      description: formData.description || undefined,
      minStock:
        formData.minStock !== "" ? Number(formData.minStock) : undefined,
    }

    setLoadingAction(true)

    try {
      if (editing) {
        await updateMedicine(editing._id, payload)
        toast({ title: "Medicine updated" })
      } else {
        await createMedicine(payload)
        toast({ title: "Medicine added" })
      }

      setOpen(false)
      resetForm()
      loadMedicines()
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Operation failed",
        description:
          err.response?.data?.message || "Something went wrong",
      })
    } finally {
      setLoadingAction(false)
    }
  }

  /* =========================
     EDIT / DELETE
  ========================= */
  const handleEdit = (med) => {
    if (!canModify) return

    setEditing(med)
    setFormData({
      name: med.name || "",
      category: med.category || "",
      minStock: med.minStock ?? "",
      description: med.description || "",
    })
    setOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return

    try {
      await deleteMedicine(deleteTarget._id)
      toast({ title: "Medicine deleted" })
      loadMedicines()
    } catch {
      toast({
        variant: "destructive",
        title: "Delete failed",
      })
    } finally {
      setDeleteTarget(null)
    }
  }

  /* =========================
     RENDER GUARD
  ========================= */
  if (loading) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Medicines</h1>

        {canModify && (
          <Button onClick={() => setOpen(true)}>
            Add Medicine
          </Button>
        )}
      </div>

      {/* Search */}
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

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle>Medicine List</CardTitle>
        </CardHeader>
        <CardContent>
          <MedicineList
            medicines={filteredMedicines}
            onEdit={handleEdit}
            onDelete={(med) => setDeleteTarget(med)}
            canModify={canModify}
          />
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
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
                setOpen(false)
                resetForm()
              }}
              isEditing={Boolean(editing)}
              loading={loadingAction}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Medicine</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">
              {deleteTarget?.name}
            </span>
            ? This action cannot be undone.
          </p>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
