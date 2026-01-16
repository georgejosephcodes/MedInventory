import React, { useState, useEffect } from 'react';
import { getDashboardStats, getBatches } from '../../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Package, AlertTriangle, TrendingUp, Calendar, Activity } from 'lucide-react';
import { formatDate, isExpiringSoon, isExpired } from '../../lib/utils';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalMedicines: 0,
    lowStock: 0,
    expiringSoon: 0,
    totalValue: 0,
    totalBatches: 0,
    expiredBatches: 0,
  });
  const [expiringBatches, setExpiringBatches] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const batchesRes = await getBatches();
      const batches = batchesRes.data.batches || [];

      // Calculate statistics
      const uniqueMedicines = new Set(batches.map(b => b.medicine?._id)).size;
      const lowStockBatches = batches.filter(b => 
        b.quantity < (b.medicine?.minStockLevel || 10)
      );
      const expiringSoonBatches = batches.filter(b => isExpiringSoon(b.expiryDate));
      const expiredBatches = batches.filter(b => isExpired(b.expiryDate));
      const totalValue = batches.reduce((sum, b) => 
        sum + (b.quantity * (b.medicine?.price || 0)), 0
      );

      setStats({
        totalMedicines: uniqueMedicines,
        lowStock: lowStockBatches.length,
        expiringSoon: expiringSoonBatches.length,
        totalValue: totalValue,
        totalBatches: batches.length,
        expiredBatches: expiredBatches.length,
      });

      // Get top 5 expiring batches
      const sorted = [...expiringSoonBatches].sort((a, b) => 
        new Date(a.expiryDate) - new Date(b.expiryDate)
      );
      setExpiringBatches(sorted.slice(0, 5));

      // Calculate category distribution
      const categoryMap = {};
      batches.forEach(batch => {
        const category = batch.medicine?.category || 'Unknown';
        if (!categoryMap[category]) {
          categoryMap[category] = { name: category, value: 0, count: 0 };
        }
        categoryMap[category].value += batch.quantity * (batch.medicine?.price || 0);
        categoryMap[category].count += 1;
      });
      setCategoryData(Object.values(categoryMap));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Medicines</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMedicines}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalBatches} batches in stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStock}</div>
            <p className="text-xs text-muted-foreground">
              Items below minimum level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Calendar className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expiringSoon}</div>
            <p className="text-xs text-muted-foreground">
              Within 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Current stock value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory by Category</CardTitle>
            <CardDescription>Value distribution across categories</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center py-8 text-muted-foreground">No category data available</p>
            )}
          </CardContent>
        </Card>

        {/* Stock Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Status Overview</CardTitle>
            <CardDescription>Current inventory health</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  {
                    name: 'Status',
                    'Good Stock': stats.totalBatches - stats.lowStock - stats.expiringSoon - stats.expiredBatches,
                    'Low Stock': stats.lowStock,
                    'Expiring Soon': stats.expiringSoon,
                    'Expired': stats.expiredBatches,
                  },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Good Stock" stackId="a" fill="#10b981" />
                <Bar dataKey="Low Stock" stackId="a" fill="#f59e0b" />
                <Bar dataKey="Expiring Soon" stackId="a" fill="#f97316" />
                <Bar dataKey="Expired" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Soon Section */}
      {expiringBatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2 text-orange-500" />
              Urgent: Expiring Soon
            </CardTitle>
            <CardDescription>Batches expiring within the next 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expiringBatches.map((batch) => {
                const daysLeft = Math.ceil(
                  (new Date(batch.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <div 
                    key={batch._id} 
                    className="flex items-center justify-between p-4 border rounded-lg bg-orange-50 border-orange-200"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{batch.medicine?.name}</p>
                      <p className="text-sm text-gray-600">
                        Batch: {batch.batchNumber} • Quantity: {batch.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-orange-600">
                        {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                      </p>
                      <p className="text-xs text-gray-600">
                        Expires: {formatDate(batch.expiryDate)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Batches</p>
                  <p className="text-2xl font-bold">{stats.totalBatches}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Expired Batches</p>
                  <p className="text-2xl font-bold text-red-600">{stats.expiredBatches}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{categoryData.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}