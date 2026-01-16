import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Pencil, Trash2, Package } from 'lucide-react';

export default function MedicineCard({ medicine, onEdit, onDelete }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{medicine.name}</CardTitle>
              <CardDescription>{medicine.genericName}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Category:</span>
            <span className="font-medium">{medicine.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Manufacturer:</span>
            <span className="font-medium">{medicine.manufacturer}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price:</span>
            <span className="font-medium">₹{medicine.price}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Min Stock:</span>
            <span className="font-medium">{medicine.minStockLevel}</span>
          </div>
          {medicine.description && (
            <div className="pt-2 border-t">
              <p className="text-muted-foreground text-xs">{medicine.description}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(medicine)}>
          <Pencil className="w-3 h-3 mr-1" />
          Edit
        </Button>
        <Button variant="outline" size="sm" onClick={() => onDelete(medicine._id)} className="text-red-500 hover:text-red-700">
          <Trash2 className="w-3 h-3 mr-1" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}