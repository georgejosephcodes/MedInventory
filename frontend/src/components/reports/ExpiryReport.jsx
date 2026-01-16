import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { formatDate } from '../../lib/utils';

export default function ExpiryReport({ data }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expired Wastage Report</CardTitle>
          <CardDescription>Medicines that expired this year</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">No expired medicines this year</p>
        </CardContent>
      </Card>
    );
  }

  const totalWastage = data.reduce((sum, item) => sum + (item.valueLost || 0), 0);
  const totalQuantity = data.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expired Wastage Report</CardTitle>
        <CardDescription>Medicines that expired this year</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="p-4 border rounded-lg bg-red-50">
            <p className="text-sm text-muted-foreground">Total Quantity Wasted</p>
            <p className="text-2xl font-bold text-red-600">{totalQuantity}</p>
          </div>
          <div className="p-4 border rounded-lg bg-red-50">
            <p className="text-sm text-muted-foreground">Total Value Lost</p>
            <p className="text-2xl font-bold text-red-600">₹{totalWastage.toLocaleString()}</p>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medicine</TableHead>
              <TableHead>Batch Number</TableHead>
              <TableHead>Quantity Wasted</TableHead>
              <TableHead>Value Lost (₹)</TableHead>
              <TableHead>Expiry Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.medicine}</TableCell>
                <TableCell>{item.batchNumber}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell className="text-red-600">₹{item.valueLost?.toLocaleString() || 0}</TableCell>
                <TableCell>{formatDate(item.expiryDate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}