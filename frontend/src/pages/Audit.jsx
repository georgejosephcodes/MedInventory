import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Search, CalendarIcon } from "lucide-react";

import { getMedicines, getStockLogs } from "../lib/api";

import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../components/ui/dropdown-menu";

import { Calendar } from "../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";

import AuditLogs from "../components/audit/AuditLogs";

/* =========================
   ACTION NORMALIZER
========================= */
const normalizeAction = (action = "") => {
  const a = action.toLowerCase();
  if (a.includes("in")) return "IN";
  if (a.includes("out")) return "OUT";
  if (a.includes("expire")) return "EXPIRED";
  return "UNKNOWN";
};

/* =========================
   DATE PICKER
========================= */
function DatePicker({ label, value, onChange }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            {value ? format(new Date(value), "MM/dd/yyyy") : "mm/dd/yyyy"}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value ? new Date(value) : undefined}
            onSelect={(date) =>
              onChange(date ? date.toISOString() : "")
            }
            captionLayout="dropdown"
            fromYear={2000}
            toYear={2035}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default function Audit() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    medicineId: "",
    startDate: "",
    endDate: "",
  });

  /* =========================
     LOAD MEDICINES
  ========================= */
  useEffect(() => {
    getMedicines()
      .then((res) => setMedicines(res.data.data || []))
      .catch(() => setError("Failed to load medicines"));
  }, []);

  /* =========================
     LOAD AUDIT LOGS
     rule:
     - default → latest 20
     - fetch all ONLY after endDate
  ========================= */
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);

        const hasDateRange = Boolean(filters.endDate);

        const res = await getStockLogs({
          medicineId: filters.medicineId || undefined,
          from: hasDateRange ? filters.startDate || undefined : undefined,
          to: hasDateRange ? filters.endDate : undefined,
          ...(hasDateRange ? {} : { limit: 20 }),
        });

        const data = res.data.data || [];
        setLogs(data);
        setFilteredLogs(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    };

    if (!filters.startDate && !filters.endDate) {
      fetchLogs();
      return;
    }

    if (filters.endDate) {
      fetchLogs();
    }
  }, [filters.medicineId, filters.startDate, filters.endDate]);

  /* =========================
     SEARCH
  ========================= */
  useEffect(() => {
    const q = filters.search.trim().toLowerCase();

    if (!q) {
      setFilteredLogs(logs);
      return;
    }

    const result = logs.filter((log) => {
      const action = normalizeAction(log.action);

      if (q === "in") return action === "IN";
      if (q === "out") return action === "OUT";
      if (q === "expired") return action === "EXPIRED";

      return (
        log.medicineId?.name?.toLowerCase().includes(q) ||
        log.batchId?.batchNumber?.toLowerCase().includes(q) ||
        log.performedBy?.name?.toLowerCase().includes(q)
      );
    });

    setFilteredLogs(result);
  }, [filters.search, logs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Audit Logs</h1>

      {error && <p className="text-red-500">{error}</p>}

      {/* FILTERS */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="medicine, batch, user, in/out/expired"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Medicine</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-10 w-full rounded-md border border-input bg-background px-3 text-left text-sm">
                    {filters.medicineId
                      ? medicines.find((m) => m._id === filters.medicineId)?.name
                      : "All medicines"}
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-64 overflow-y-auto">
                  <DropdownMenuItem
                    onClick={() =>
                      setFilters({ ...filters, medicineId: "" })
                    }
                  >
                    All medicines
                  </DropdownMenuItem>

                  {medicines.map((m) => (
                    <DropdownMenuItem
                      key={m._id}
                      onClick={() =>
                        setFilters({ ...filters, medicineId: m._id })
                      }
                    >
                      {m.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <DatePicker
              label="Start Date"
              value={filters.startDate}
              onChange={(v) =>
                setFilters({ ...filters, startDate: v })
              }
            />

            <DatePicker
              label="End Date"
              value={filters.endDate}
              onChange={(v) =>
                setFilters({ ...filters, endDate: v })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card>
        <CardContent className="p-0">
          <AuditLogs logs={filteredLogs} />
        </CardContent>
      </Card>
    </div>
  );
}
