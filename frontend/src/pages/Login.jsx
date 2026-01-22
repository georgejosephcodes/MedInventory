import React, { useState, useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { forgotPassword } from "../lib/api"

import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"

import { Pill, Moon, Sun, Info } from "lucide-react"

/* =========================
   TOGGLE DEMO CREDENTIALS
   (set true when needed)
========================= */
const SHOW_DEMO_CREDENTIALS = false

export default function Login() {
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSuccess, setForgotSuccess] = useState(false)

  const [darkMode, setDarkMode] = useState(false)

  /* =========================
     DARK MODE INIT
  ========================= */
  useEffect(() => {
    const stored = localStorage.getItem("theme")
    const isDark =
      stored === "dark" ||
      (!stored &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)

    setDarkMode(isDark)
    document.documentElement.classList.toggle("dark", isDark)
  }, [])

  const toggleTheme = () => {
    const next = !darkMode
    setDarkMode(next)
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("theme", next ? "dark" : "light")
  }

  /* =========================
     LOGIN
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return

    setLoading(true)
    setError("")

    const result = await login(email, password)

    if (!result.success) {
      setError(result.error || "Login failed")
    } else {
      navigate("/dashboard", { replace: true })
    }

    setLoading(false)
  }

  /* =========================
     FORGOT PASSWORD
  ========================= */
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setForgotLoading(true)
    setError("")

    try {
      await forgotPassword(forgotEmail)
      setForgotSuccess(true)

      setTimeout(() => {
        setForgotPasswordOpen(false)
        setForgotSuccess(false)
        setForgotEmail("")
      }, 2500)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset email")
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background p-4">
      {/* THEME TOGGLE */}
      <button
        onClick={toggleTheme}
        className="absolute right-4 top-4 rounded-lg border bg-background p-2 text-muted-foreground hover:bg-accent"
        aria-label="Toggle theme"
      >
        {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <div className="w-full max-w-md space-y-4">
        {/* DEMO CREDENTIALS (HIDDEN) */}
        {SHOW_DEMO_CREDENTIALS && (
          <Card className="border-dashed bg-muted/40">
            <CardContent className="pt-4 text-sm">
              <div className="flex items-start gap-2 text-muted-foreground">
                <Info className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-foreground">
                    Demo Version – Test Credentials
                  </p>

                  <p className="mt-2">
                    <span className="font-medium">Admin:</span>{" "}
                    adminone@med.com
                  </p>
                  <p>
                    <span className="font-medium">Staff:</span>{" "}
                    staffone@med.com
                  </p>
                  <p>
                    <span className="font-medium">Pharmacist:</span>{" "}
                    pharmacistone@med.com
                  </p>

                  <p className="mt-2">
                    <span className="font-medium">Password:</span>{" "}
                    admin123
                  </p>

                  <p className="mt-2 text-xs">
                    ⚠️ Demo environment. Data may reset periodically.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* LOGIN CARD */}
        <Card>
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-200 dark:bg-sky-400/20">
                <Pill className="h-6 w-6 text-sky-700 dark:text-sky-300" />
              </div>
            </div>

            <CardTitle className="text-2xl">MedInventory</CardTitle>
            <CardDescription>
              Secure access to your medical inventory system
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="admin@med.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Password</Label>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    className="text-xs text-sky-600 hover:underline dark:text-sky-400"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in…" : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* FORGOT PASSWORD DIALOG */}
      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Forgot Password</DialogTitle>
            <DialogDescription>
              Enter your email and we’ll send you a reset link.
            </DialogDescription>
          </DialogHeader>

          {forgotSuccess ? (
            <div className="rounded-lg border border-sky-300 bg-sky-100 px-4 py-3 text-sm text-sky-900 dark:border-sky-400/40 dark:bg-sky-400/10 dark:text-sky-200">
              ✓ Reset link sent successfully
            </div>
          ) : (
            <form onSubmit={handleForgotPassword}>
              <div className="space-y-2 py-4">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForgotPasswordOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={forgotLoading}>
                  {forgotLoading ? "Sending…" : "Send Reset Link"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
