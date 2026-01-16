import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { formatDate, isExpiringSoon, isExpired } from '../../lib/utils';

export default function BatchList({ batches }) {
  const getBatchStatus = (batch) => {
    if (isExpired(batch.expiryDate)) {
      return { text: 'Expired', color: 'text-red-600 bg-red-50' };
    }
    if (isExpiringSoon(batch.expiryDate)) {
      return { text: 'Expiring Soon', color: 'text-orange-600 bg-orange-50' };
    }
    if (batch.quantity < (batch.medicine?.minStockLevel || 10)) {
      return { text: 'Low Stock', color: 'text-yellow-600 bg-yellow-50' };
    }
    return { text: 'Good', color: 'text-green-600 bg-green-50' };
  };

  if (batches.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No batches found
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Medicine</TableHead>
          <TableHead>Batch Number</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Expiry Date</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {batches.map((batch) => {
          const status = getBatchStatus(batch);
          return (
            <TableRow key={batch._id}>
              <TableCell className="font-medium">{batch.medicine?.name || 'N/A'}</TableCell>
              <TableCell>{batch.batchNumber}</TableCell>
              <TableCell>{batch.quantity}</TableCell>
              <TableCell>{formatDate(batch.expiryDate)}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                  {status.text}
                </span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}