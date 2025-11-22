"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Shield, Edit, Save, X, Star, TrendingUp, FileText, Clock, Users } from "lucide-react"

const adminData = {
  name: "Dr. Sarah Johnson",
  email: "sarah.johnson@college.edu",
  collegeId: "ADM-2020-005",
  department: "Administration",
  position: "Dean of Student Affairs",
  level: 3,
  phone: "+1 (555) 987-6543",
  joinDate: "March 2020",
  avatar: "/admin-avatar.png",
}

const adminStats = {
  totalAssigned: 89,
  resolvedComplaints: 76,
  averageRating: 4.1,
  averageResolutionTime: 5.8,
  onTimeResolution: 87,
}

const recentAssignments = [
  {
    id: "CMP-045",
    title: "Student Accommodation Issues",
    status: "resolved",
    date: "2025-01-14",
    rating: 4,
    priority: "high",
  },
  {
    id: "CMP-067",
    title: "Academic Policy Clarification",
    status: "in-progress",
    date: "2025-01-13",
    rating: null,
    priority: "medium",
  },
  {
    id: "CMP-089",
    title: "Campus Safety Concerns",
    status: "resolved",
    date: "2025-01-11",
    rating: 5,
    priority: "high",
  },
]

export function AdminProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(adminData)

  const handleSave = () => {
    console.log("Saving admin profile data:", formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData(adminData)
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Authority Profile
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
                <AvatarImage src={adminData.avatar || "/placeholder.svg"} alt={adminData.name} />
                <AvatarFallback className="text-lg">
                  {adminData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="text-center space-y-1">
                <Badge variant="secondary">Level {adminData.level} Authority</Badge>
                <Badge className="bg-primary text-primary-foreground">{adminData.position}</Badge>
              </div>
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
                    <h3 className="font-semibold text-lg">{adminData.name}</h3>
                    <p className="text-muted-foreground">{adminData.email}</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">College ID:</span> {adminData.collegeId}
                    </div>
                    <div>
                      <span className="font-medium">Department:</span> {adminData.department}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span> {adminData.phone}
                    </div>
                    <div>
                      <span className="font-medium">Joined:</span> {adminData.joinDate}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Statistics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assigned</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.totalAssigned}</div>
            <p className="text-xs text-muted-foreground">All time assignments</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((adminStats.resolvedComplaints / adminStats.totalAssigned) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">{adminStats.resolvedComplaints} resolved</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Student Rating</CardTitle>
            <Star className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.averageRating}</div>
            <div className="flex mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${star <= Math.round(adminStats.averageRating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
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
            <div className="text-2xl font-bold">{adminStats.averageResolutionTime}d</div>
            <p className="text-xs text-muted-foreground">Average days</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.onTimeResolution}%</div>
            <p className="text-xs text-muted-foreground">Within deadline</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Assignments */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Recent Assignments</CardTitle>
          <CardDescription>Your latest complaint assignments and student ratings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-3 border border-border rounded-lg"
              >
                <div className="space-y-1">
                  <h4 className="font-medium text-sm">{assignment.title}</h4>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`text-xs ${
                        assignment.status === "resolved"
                          ? "bg-green-500 text-white"
                          : assignment.status === "in-progress"
                            ? "bg-blue-500 text-white"
                            : "bg-yellow-500 text-white"
                      }`}
                    >
                      {assignment.status}
                    </Badge>
                    <Badge
                      className={`text-xs ${
                        assignment.priority === "high"
                          ? "bg-red-500 text-white"
                          : assignment.priority === "medium"
                            ? "bg-yellow-500 text-white"
                            : "bg-green-500 text-white"
                      }`}
                    >
                      {assignment.priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{assignment.date}</span>
                  </div>
                </div>
                <div className="text-right">
                  {assignment.rating ? (
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">Rated:</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${star <= assignment.rating! ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
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
