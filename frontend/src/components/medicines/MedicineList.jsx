import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Pencil, Trash2 } from "lucide-react";

export default function MedicineList({
  medicines,
  onEdit,
  onDelete,
  canModify, // 👈 ADMIN only flag
}) {
  if (!medicines.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No medicines found
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Min Stock</TableHead>
          <TableHead>Description</TableHead>

          {/* 🔒 Actions column — ADMIN ONLY */}
          {canModify && (
            <TableHead className="text-right">Actions</TableHead>
          )}
        </TableRow>
      </TableHeader>

      <TableBody>
        {medicines.map((med) => (
          <TableRow key={med._id}>
            <TableCell className="font-medium">{med.name}</TableCell>
            <TableCell>{med.category}</TableCell>
            <TableCell>{med.minStock ?? "-"}</TableCell>
            <TableCell>{med.description || "-"}</TableCell>

            {/* 🔒 Action buttons — ADMIN ONLY */}
            {canModify && (
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(med)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(med._id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
