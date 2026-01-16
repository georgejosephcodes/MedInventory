import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

/* =========================
   COLOR MAPPER
========================= */
const getTypeColor = (type) => {
  switch (type) {
    case "IN":
      return "bg-green-100 text-green-700";
    case "OUT":
      return "bg-blue-100 text-blue-700";
    case "EXPIRED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

/* =========================
   ACTION NORMALIZER
========================= */
const normalizeAction = (action = "") => {
  if (action.includes("IN")) return "IN";
  if (action.includes("OUT")) return "OUT";
  if (action.includes("EXPIRE")) return "EXPIRED";
  return "UNKNOWN";
};

export default function AuditLogs({ logs }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No audit logs found
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="whitespace-nowrap">Date</TableHead>
          <TableHead className="whitespace-nowrap text-center">Type</TableHead>
          <TableHead className="whitespace-nowrap">Medicine</TableHead>
          <TableHead className="whitespace-nowrap">Batch</TableHead>
          <TableHead className="whitespace-nowrap text-center">Expiry</TableHead>
          <TableHead className="whitespace-nowrap text-center">Qty</TableHead>
          <TableHead className="whitespace-nowrap text-center">
            Unit Price (₹)
          </TableHead>
          <TableHead className="whitespace-nowrap text-center">
            Total Cost (₹)
          </TableHead>
          <TableHead className="whitespace-nowrap">
            Supplier / Note
          </TableHead>
          <TableHead className="whitespace-nowrap">User</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {logs.map((log) => {
          const actionType = normalizeAction(log.action);

          return (
            <TableRow key={log._id} className="align-middle">
              {/* DATE */}
              <TableCell className="whitespace-nowrap">
                {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm")}
              </TableCell>

              {/* ACTION */}
              <TableCell className="text-center">
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(
                    actionType
                  )}`}
                >
                  {log.action}
                </span>
              </TableCell>

              {/* MEDICINE */}
              <TableCell>{log.medicineId?.name || "-"}</TableCell>

              {/* BATCH */}
              <TableCell>{log.batchId?.batchNumber || "-"}</TableCell>

              {/* EXPIRY */}
              <TableCell className="text-center whitespace-nowrap">
                {log.batchId?.expiryDate
                  ? format(
                      new Date(log.batchId.expiryDate),
                      "dd/MM/yyyy"
                    )
                  : "-"}
              </TableCell>

              {/* QUANTITY */}
              <TableCell className="text-center">
                {log.quantity}
              </TableCell>

              {/* UNIT PRICE */}
              <TableCell className="text-center whitespace-nowrap">
                {log.unitPrice ? `₹${log.unitPrice}` : "-"}
              </TableCell>

              {/* TOTAL COST */}
              <TableCell className="text-center font-medium whitespace-nowrap">
                {log.totalCost ? `₹${log.totalCost.toFixed(2)}` : "-"}
              </TableCell>

              {/* SUPPLIER / NOTE */}
              <TableCell className="text-muted-foreground">
                {log.note || "-"}
              </TableCell>

              {/* USER */}
              <TableCell>
                <div className="leading-tight">
                  <p className="font-medium">
                    {log.performedBy?.name || "—"}
                  </p>
                  {log.performedBy?.email && (
                    <p className="text-xs text-muted-foreground">
                      {log.performedBy.email}
                    </p>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
