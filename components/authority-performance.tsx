"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Star, TrendingUp, TrendingDown, Clock, CheckCircle } from "lucide-react"

const authorityPerformance = [
  {
    id: 1,
    name: "IT Department",
    level: 1,
    department: "IT",
    totalComplaints: 45,
    resolvedComplaints: 38,
    averageResolutionTime: 3.2,
    rating: 4.2,
    onTimeResolution: 85,
    trend: "up",
    recentComplaints: 12,
  },
  {
    id: 2,
    name: "Library Staff",
    level: 1,
    department: "Library",
    totalComplaints: 28,
    resolvedComplaints: 26,
    averageResolutionTime: 2.1,
    rating: 4.6,
    onTimeResolution: 93,
    trend: "up",
    recentComplaints: 5,
  },
  {
    id: 3,
    name: "Hostel Warden",
    level: 2,
    department: "Hostel",
    totalComplaints: 67,
    resolvedComplaints: 52,
    averageResolutionTime: 4.8,
    rating: 3.8,
    onTimeResolution: 78,
    trend: "down",
    recentComplaints: 18,
  },
  {
    id: 4,
    name: "Dean of Student Affairs",
    level: 3,
    department: "Administration",
    totalComplaints: 23,
    resolvedComplaints: 20,
    averageResolutionTime: 6.2,
    rating: 4.1,
    onTimeResolution: 87,
    trend: "up",
    recentComplaints: 8,
  },
]

export function AuthorityPerformance() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {authorityPerformance.map((authority) => (
          <Card key={authority.id} className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {authority.name}
                    <Badge variant="outline">Level {authority.level}</Badge>
                    <Badge variant="secondary">{authority.department}</Badge>
                  </CardTitle>
                  <CardDescription>Performance metrics and ratings</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {authority.trend === "up" ? (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{authority.rating}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4" />
                    Resolution Rate
                  </div>
                  <div className="text-2xl font-bold">
                    {Math.round((authority.resolvedComplaints / authority.totalComplaints) * 100)}%
                  </div>
                  <Progress value={(authority.resolvedComplaints / authority.totalComplaints) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {authority.resolvedComplaints} of {authority.totalComplaints} resolved
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    Avg Resolution Time
                  </div>
                  <div className="text-2xl font-bold">{authority.averageResolutionTime}d</div>
                  <p className="text-xs text-muted-foreground">Average days to resolve</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    On-Time Resolution
                  </div>
                  <div className="text-2xl font-bold">{authority.onTimeResolution}%</div>
                  <Progress value={authority.onTimeResolution} className="h-2" />
                  <p className="text-xs text-muted-foreground">Resolved within deadline</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="w-4 h-4" />
                    Student Rating
                  </div>
                  <div className="text-2xl font-bold">{authority.rating}/5</div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= Math.round(authority.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Based on student feedback</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Recent complaints assigned:</span>
                  <span className="font-medium">{authority.recentComplaints} this month</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
