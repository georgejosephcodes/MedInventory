import React from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { DialogFooter } from '../ui/dialog';
import { AlertTriangle } from 'lucide-react';

export default function StockOutForm({ formData, setFormData, medicines, onSubmit, onCancel }) {
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="medicineOut">Medicine *</Label>
          <select
            id="medicineOut"
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
          <Label htmlFor="quantityOut">Quantity *</Label>
          <Input
            id="quantityOut"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
            placeholder="Enter quantity to issue"
            required
          />
        </div>

        <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <AlertTriangle className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">FEFO Policy</p>
            <p className="text-xs">
              Stock will be automatically issued from batches with the earliest expiry date (First-Expire-First-Out).
            </p>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Issue Stock</Button>
      </DialogFooter>
    </form>
  );
}