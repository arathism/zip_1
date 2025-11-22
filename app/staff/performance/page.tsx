"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, BarChart3, TrendingUp, Clock, CheckCircle, Users, Star, ArrowLeft } from "lucide-react"
import { PerformanceStats } from "@/types"
import { dummyPerformance } from "@/lib/dummy-data"

export default function StaffPerformance() {
  const [performance, setPerformance] = useState<PerformanceStats | null>(null)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/auth/login")
      return
    }

    setPerformance(dummyPerformance)
  }, [router])

  if (!performance) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 text-primary animate-pulse mx-auto" />
          <p className="mt-4 text-lg text-foreground">Loading Performance Data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg">
      <header className="bg-card/50 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => router.push("/staff/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Brain className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Performance Analytics</h1>
                <p className="text-sm text-muted-foreground">Track your performance metrics and statistics</p>
              </div>
            </div>
            <Button onClick={() => router.push("/staff/dashboard")}>
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Resolution Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{performance.resolutionRate}%</div>
              <p className="text-xs text-muted-foreground">+5% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Avg. Resolution Time</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{performance.avgResolutionTime}</div>
              <p className="text-xs text-muted-foreground">Days per complaint</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Student Satisfaction</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{performance.studentSatisfaction}</div>
              <p className="text-xs text-muted-foreground">Out of 5 stars</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Total Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{performance.totalResolved}</div>
              <p className="text-xs text-muted-foreground">Complaints resolved</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <BarChart3 className="w-5 h-5" />
                Performance by Category
              </CardTitle>
              <CardDescription>Breakdown of complaints by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performance.categoryBreakdown.map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-green-500' :
                        index === 2 ? 'bg-yellow-500' :
                        index === 3 ? 'bg-purple-500' : 'bg-gray-500'
                      }`} />
                      <span className="text-foreground">{category.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-foreground">
                        {category.resolved}/{category.count}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round((category.resolved / category.count) * 100)}% resolved
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Users className="w-5 h-5" />
                Performance Summary
              </CardTitle>
              <CardDescription>Overall performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Total Assigned Complaints</span>
                  <span className="font-bold text-foreground">{performance.totalAssigned}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Successfully Resolved</span>
                  <span className="font-bold text-green-600">{performance.totalResolved}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Currently Pending</span>
                  <span className="font-bold text-yellow-600">{performance.pendingCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Overdue Complaints</span>
                  <span className="font-bold text-red-600">{performance.overdueCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Overall Efficiency</span>
                  <span className="font-bold text-blue-600">{performance.resolutionRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Achievements */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 mt-6">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Achievements</CardTitle>
            <CardDescription>Your recent performance milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Resolution Rate Improved</p>
                  <p className="text-sm text-green-600">Your resolution rate increased by 5% this month</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">Faster Resolution Time</p>
                  <p className="text-sm text-blue-600">Average resolution time decreased by 0.7 days</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">High Satisfaction Rating</p>
                  <p className="text-sm text-yellow-600">Received 4.2/5 average student satisfaction</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}