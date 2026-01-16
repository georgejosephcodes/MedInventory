import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { DialogFooter } from "../ui/dialog";

export default function MedicineForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isEditing,
}) {
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="grid gap-4 py-4">
        {/* NAME */}
        <div className="space-y-2">
          <Label>Medicine Name *</Label>
          <Input
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="e.g., Paracetamol"
            required
          />
        </div>

        {/* CATEGORY */}
        <div className="space-y-2">
          <Label>Category *</Label>
          <Input
            value={formData.category}
            onChange={(e) => handleChange("category", e.target.value)}
            placeholder="e.g., Analgesic"
            required
          />
        </div>

        {/* MIN STOCK */}
        <div className="space-y-2">
          <Label>Minimum Stock</Label>
          <Input
            type="number"
            min="0"
            value={formData.minStock}
            onChange={(e) => handleChange("minStock", e.target.value)}
            placeholder="10"
          />
        </div>

        {/* DESCRIPTION */}
        <div className="space-y-2">
          <Label>Description</Label>
          <Input
            value={formData.description}
            onChange={(e) =>
              handleChange("description", e.target.value)
            }
            placeholder="Additional information about the medicine"
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {isEditing ? "Update" : "Add"} Medicine
        </Button>
      </DialogFooter>
    </form>
  );
}
