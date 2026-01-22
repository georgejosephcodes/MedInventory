import React, { useState, useEffect } from "react"
import {
  adminGetUsers,
  adminCreateUser,
  adminUpdateUser,
  adminDisableUser,
  adminEnableUser,
} from "../lib/api"

import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import {
  Card,
  CardContent,
  CardHeader,
} from "../components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { Plus, Pencil, Trash2, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function Users() {
  const { toast } = useToast()

  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  const [confirmUser, setConfirmUser] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "STAFF",
  })

  /* =========================
     LOAD USERS
  ========================= */
  const fetchUsers = async () => {
    try {
      const res = await adminGetUsers()
      setUsers(res.data.users || [])
    } catch {
      toast({ variant: "destructive", title: "Failed to load users" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  /* =========================
     SEARCH
  ========================= */
  useEffect(() => {
    const filtered = users.filter(
      (u) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [searchTerm, users])

  /* =========================
     CREATE / UPDATE
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingUser) {
        await adminUpdateUser(editingUser._id, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        })
        toast({ title: "User updated" })
      } else {
        await adminCreateUser(formData)
        toast({ title: "User created" })
      }

      fetchUsers()
      closeUserDialog()
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Operation failed",
        description: err.response?.data?.message,
      })
    }
  }

  const handleEdit = (user) => {
    if (user.role === "ADMIN") return

    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    })
    setDialogOpen(true)
  }

  /* =========================
     ENABLE / DISABLE
  ========================= */
  const handleConfirmAction = async () => {
    if (!confirmUser) return
    setActionLoading(true)

    try {
      confirmUser.isActive
        ? await adminDisableUser(confirmUser._id)
        : await adminEnableUser(confirmUser._id)

      toast({
        title: confirmUser.isActive ? "User disabled" : "User enabled",
      })

      fetchUsers()
      setConfirmUser(null)
    } catch {
      toast({
        variant: "destructive",
        title: "Action failed",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const closeUserDialog = () => {
    setDialogOpen(false)
    setEditingUser(null)
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "STAFF",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage system users and roles
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* TABLE */}
      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search users…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow
                  key={user._id}
                  className={!user.isActive ? "opacity-50" : ""}
                >
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(user)}
                        disabled={user.role === "ADMIN"}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setConfirmUser(user)}
                        disabled={user.role === "ADMIN"}
                      >
                        <Trash2
                          className={`w-4 h-4 ${
                            user.isActive
                              ? "text-red-500"
                              : "text-green-600"
                          }`}
                        />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* CREATE / EDIT */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Edit User" : "Add User"}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? "Update user details"
                : "Create a new system user"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            {!editingUser && (
              <div>
                <Label>Temporary Password</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>
            )}

            <div>
              <Label>Role</Label>
              <Select
                value={formData.role}
                onValueChange={(v) =>
                  setFormData({ ...formData, role: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="PHARMACIST">Pharmacist</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeUserDialog}>
                Cancel
              </Button>
              <Button type="submit">
                {editingUser ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CONFIRM ENABLE / DISABLE */}
      <Dialog open={!!confirmUser} onOpenChange={() => setConfirmUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmUser?.isActive ? "Disable User" : "Enable User"}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to{" "}
              {confirmUser?.isActive ? "disable" : "enable"} this user?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmUser(null)}
            >
              Cancel
            </Button>
            <Button
              variant={confirmUser?.isActive ? "destructive" : "default"}
              onClick={handleConfirmAction}
              disabled={actionLoading}
            >
              {actionLoading ? "Processing…" : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
