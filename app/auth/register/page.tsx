"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/password-input"
import { Brain, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    collegeId: "",
    password: "",
    confirmPassword: "",
    role: "student",
    category: "", // Added category field
    phone: "", // Added phone field for SMS notifications
    department: "", // Added department field
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // College complaint categories for staff
  const complaintCategories = [
    'Academic',
    'Administrative',
    'Infrastructure',
    'Hostel',
    'Library',
    'Laboratory',
    'Sports',
    'Canteen',
    'Transport',
    'Security',
    'WiFi & Internet',
    'Washroom',
    'Electricity',
    'Water Supply',
    'Other'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match")
        setIsLoading(false)
        return
      }

      // Validate password strength
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long")
        setIsLoading(false)
        return
      }

      // Validate category for staff role
      if (formData.role === "staff" && !formData.category) {
        setError("Please select a complaint category for staff role")
        setIsLoading(false)
        return
      }

      // Validate department
      if (!formData.department) {
        setError("Please enter your department")
        setIsLoading(false)
        return
      }

      // Validate phone number for SMS notifications
      const phoneRegex = /^[6-9]\d{9}$/;
      const cleanedPhone = formData.phone.replace(/\D/g, '');
      if (!phoneRegex.test(cleanedPhone)) {
        setError("Please enter a valid 10-digit Indian phone number starting with 6-9")
        setIsLoading(false)
        return
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          collegeId: formData.collegeId,
          password: formData.password,
          role: formData.role,
          category: formData.category,
          phone: cleanedPhone,
          department: formData.department,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        let successMessage = "Registration successful! ";
        
        if (result.notifications?.email === 'sent') {
          successMessage += "Check your email for confirmation. ";
        }
        if (result.notifications?.sms === 'sent') {
          successMessage += "SMS sent to your phone. ";
        } else if (result.notifications?.sms === 'failed') {
          successMessage += "(SMS notification failed) ";
        }
        
        alert(successMessage + "Please login with your credentials.");
        router.push("/auth/login")
      } else {
        setError(result.error || "Registration failed. Please try again.")
      }
    } catch (error) {
      console.error("Registration error:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear category when role changes from staff to something else
    if (name === "role" && value !== "staff") {
      setFormData(prev => ({
        ...prev,
        category: ""
      }))
    }
    
    setError("") // Clear error when user starts typing
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Brain className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold">SolveIT</span>
            </div>
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Sign up for your SolveIT account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg">
                  {error}
                </div>
              )}

              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role">Register As</Label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Category dropdown - only shown for staff role */}
              {formData.role === "staff" && (
                <div className="space-y-2">
                  <Label htmlFor="category">Complaint Category *</Label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required={formData.role === "staff"}
                  >
                    <option value="">Select complaint category</option>
                    {complaintCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Select the area where you'll handle student complaints
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter your 10-digit phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  pattern="[6-9]\d{9}"
                  title="Please enter a valid 10-digit Indian phone number starting with 6-9"
                />
                <p className="text-xs text-muted-foreground">
                  For SMS notifications and account verification
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="collegeId">College ID *</Label>
                <Input
                  id="collegeId"
                  name="collegeId"
                  type="text"
                  placeholder="Enter your College ID"
                  value={formData.collegeId}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Input
                  id="department"
                  name="department"
                  type="text"
                  placeholder="Enter your department (e.g., Computer Science, Mechanical Engineering)"
                  value={formData.department}
                  onChange={handleChange}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Enter your academic or administrative department
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <PasswordInput
                  id="password"
                  name="password"
                  placeholder="Create a password (min. 6 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>

            {/* Demo Credentials Info - Matching login page style */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Note:</h4>
              <div className="text-xs text-blue-700 space-y-1">
                <p>After registration, you'll receive email and SMS confirmation.</p>
                <p className="mt-2"><strong>Example:</strong> Use "123" as College ID for testing student accounts.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}