import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import {
  getMonthlyUsage,
  getTopConsumed,
  getExpiredWastage,
} from "../lib/api";

import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label as RechartLabel,
} from "recharts";

import { Calendar } from "../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";

/* =========================
   COLOR PALETTE
========================= */
const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
  "#ec4899",
  "#6366f1",
];

/* =========================
   DATE PICKER
========================= */
function DatePicker({ label, value, onChange }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-left">
            {value ? format(value, "MM/dd/yyyy") : "mm/dd/yyyy"}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            captionLayout="dropdown"
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default function Reports() {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(today);

  const [usage, setUsage] = useState([]);
  const [top, setTop] = useState([]);
  const [expired, setExpired] = useState([]);

  /* =========================
     FETCH REPORTS
  ========================= */
  useEffect(() => {
    const fetchReports = async () => {
      const [u, t, e] = await Promise.all([
        getMonthlyUsage({ from: from.toISOString(), to: to.toISOString() }),
        getTopConsumed({ from: from.toISOString(), to: to.toISOString() }),
        getExpiredWastage({ from: from.toISOString(), to: to.toISOString() }),
      ]);

      setUsage(u.data.data || []);
      setTop(t.data.data || []);
      setExpired(e.data.data || []);
    };

    fetchReports();
  }, [from, to]);

  const calcTotals = (data, qtyKey) => ({
    units: data.reduce((s, i) => s + (i[qtyKey] || 0), 0),
    cost: data.reduce((s, i) => s + (i.totalCost || 0), 0),
  });

  const usageTotals = useMemo(() => calcTotals(usage, "totalUsed"), [usage]);
  const topTotals = useMemo(() => calcTotals(top, "totalUsed"), [top]);
  const expiredTotals = useMemo(() => calcTotals(expired, "wastedQty"), [expired]);

  const colorMap = useMemo(() => {
    const map = {};
    let i = 0;
    [...usage, ...top, ...expired].forEach((item) => {
      const key = item.medicine || item.name;
      if (!map[key]) map[key] = COLORS[i++ % COLORS.length];
    });
    return map;
  }, [usage, top, expired]);

  const Donut = ({ data, dataKey, nameKey, totals }) => {
    if (!data.length) {
      return (
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          Nothing to show here
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            innerRadius={70}
            outerRadius={110}
            strokeWidth={2}
          >
            {data.map((i, idx) => (
              <Cell
                key={idx}
                fill={colorMap[i[nameKey] || i.medicine]}
              />
            ))}
            <RechartLabel
              content={({ viewBox }) => (
                <text
                  x={viewBox.cx}
                  y={viewBox.cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  <tspan className="fill-foreground text-lg font-semibold">
                    Units: {totals.units}
                  </tspan>
                  <tspan
                    x={viewBox.cx}
                    dy={20}
                    className="fill-muted-foreground text-sm"
                  >
                    (₹{totals.cost.toFixed(2)})
                  </tspan>
                </text>
              )}
            />
          </Pie>
          <Tooltip
            formatter={(value, name, props) => [
              `Units: ${value} | ₹${(props.payload.totalCost || 0).toFixed(2)}`,
              name,
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">
          Analytics based on selected date range
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
        <DatePicker label="Start Date" value={from} onChange={setFrom} />
        <DatePicker label="End Date" value={to} onChange={setTo} />
      </div>

      <Tabs defaultValue="usage">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="top">Top Consumed</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
        </TabsList>

        <TabsContent value="usage">
          <Card>
            <CardHeader><CardTitle>Usage Distribution</CardTitle></CardHeader>
            <CardContent>
              <Donut
                data={usage}
                dataKey="totalUsed"
                nameKey="medicine"
                totals={usageTotals}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top">
          <Card>
            <CardHeader><CardTitle>Top Consumed</CardTitle></CardHeader>
            <CardContent>
              <Donut
                data={top}
                dataKey="totalUsed"
                nameKey="name"
                totals={topTotals}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expired">
          <Card>
            <CardHeader><CardTitle>Expired / Wastage</CardTitle></CardHeader>
            <CardContent>
              <Donut
                data={expired}
                dataKey="wastedQty"
                nameKey="name"
                totals={expiredTotals}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
