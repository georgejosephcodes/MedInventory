import React from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { DialogFooter } from '../ui/dialog';

export default function StockInForm({ formData, setFormData, medicines, onSubmit, onCancel }) {
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="medicine">Medicine *</Label>
          <select
            id="medicine"
            value={formData.medicine}
            onChange={(e) => handleChange('medicine', e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            required
          >
            <option value="">Select medicine</option>
            {medicines.map((med) => (
              <option key={med._id} value={med._id}>
                {med.name} - {med.genericName}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="batchNumber">Batch Number *</Label>
          <Input
            id="batchNumber"
            value={formData.batchNumber}
            onChange={(e) => handleChange('batchNumber', e.target.value)}
            placeholder="e.g., BATCH001"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
            placeholder="Enter quantity"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiryDate">Expiry Date *</Label>
          <Input
            id="expiryDate"
            type="date"
            min={getTomorrowDate()}
            value={formData.expiryDate}
            onChange={(e) => handleChange('expiryDate', e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            Must be a future date
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add Stock</Button>
      </DialogFooter>
    </form>
  );
}