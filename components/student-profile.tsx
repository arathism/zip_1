"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Edit, Save, X, Star, TrendingUp, FileText, Clock } from "lucide-react"

const studentData = {
  name: "John Doe",
  email: "john.doe@college.edu",
  collegeId: "STU-2023-001",
  department: "Computer Science",
  year: "3rd Year",
  phone: "+1 (555) 123-4567",
  joinDate: "August 2023",
  avatar: "/student-avatar.png",
}

const studentStats = {
  totalComplaints: 12,
  resolvedComplaints: 9,
  averageRating: 4.2,
  averageResolutionTime: 4.1,
}

const recentActivity = [
  {
    id: "CMP-001",
    title: "Hostel WiFi Connection Issues",
    status: "resolved",
    date: "2025-01-15",
    rating: 4,
  },
  {
    id: "CMP-002",
    title: "Library Book Request",
    status: "resolved",
    date: "2025-01-10",
    rating: 5,
  },
  {
    id: "CMP-003",
    title: "Canteen Food Quality",
    status: "in-progress",
    date: "2025-01-12",
    rating: null,
  },
]

export function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(studentData)

  const handleSave = () => {
    // In a real app, this would save to the backend
    console.log("Saving profile data:", formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData(studentData)
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="w-6 h-6 text-primary" />
              Student Profile
            </CardTitle>
            {!isEditing ? (
              <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2 bg-transparent">
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel} size="sm" className="gap-2 bg-transparent">
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
                <Button onClick={handleSave} size="sm" className="gap-2">
                  <Save className="w-4 h-4" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={studentData.avatar || "/placeholder.svg"} alt={studentData.name} />
                <AvatarFallback className="text-lg">
                  {studentData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <Badge variant="secondary">{studentData.year}</Badge>
            </div>

            <div className="flex-1 space-y-4">
              {isEditing ? (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{studentData.name}</h3>
                    <p className="text-muted-foreground">{studentData.email}</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">College ID:</span> {studentData.collegeId}
                    </div>
                    <div>
                      <span className="font-medium">Department:</span> {studentData.department}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span> {studentData.phone}
                    </div>
                    <div>
                      <span className="font-medium">Joined:</span> {studentData.joinDate}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentStats.totalComplaints}</div>
            <p className="text-xs text-muted-foreground">All time submissions</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((studentStats.resolvedComplaints / studentStats.totalComplaints) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">{studentStats.resolvedComplaints} resolved</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating Given</CardTitle>
            <Star className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentStats.averageRating}</div>
            <div className="flex mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${star <= Math.round(studentStats.averageRating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentStats.averageResolutionTime}d</div>
            <p className="text-xs text-muted-foreground">Average days</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest complaint submissions and ratings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-medium text-sm">{activity.title}</h4>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`text-xs ${
                        activity.status === "resolved"
                          ? "bg-green-500 text-white"
                          : activity.status === "in-progress"
                            ? "bg-blue-500 text-white"
                            : "bg-yellow-500 text-white"
                      }`}
                    >
                      {activity.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{activity.date}</span>
                  </div>
                </div>
                <div className="text-right">
                  {activity.rating ? (
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">Rated:</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${star <= activity.rating! ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Pending rating</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
