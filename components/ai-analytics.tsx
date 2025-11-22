"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, TrendingUp, AlertTriangle, Target, Zap, BarChart3 } from "lucide-react"

const aiInsights = [
  {
    type: "trend",
    title: "Complaint Pattern Analysis",
    description: "Hostel-related complaints have increased by 35% in the past 2 weeks",
    severity: "medium",
    recommendation: "Consider proactive maintenance checks in hostel facilities",
    confidence: 87,
    icon: TrendingUp,
  },
  {
    type: "prediction",
    title: "Escalation Risk Prediction",
    description: "3 complaints are likely to escalate within 24 hours if not addressed",
    severity: "high",
    recommendation: "Prioritize CMP-001, CMP-045, and CMP-078 for immediate attention",
    confidence: 92,
    icon: AlertTriangle,
  },
  {
    type: "optimization",
    title: "Resource Allocation Suggestion",
    description: "IT Department workload is 40% above optimal capacity",
    severity: "medium",
    recommendation: "Consider redistributing 5 pending IT complaints to Level 2 authorities",
    confidence: 78,
    icon: Target,
  },
  {
    type: "performance",
    title: "Authority Performance Insight",
    description: "Library Staff has consistently high ratings but increasing response time",
    severity: "low",
    recommendation: "Investigate potential bottlenecks in library complaint processing",
    confidence: 85,
    icon: BarChart3,
  },
]

const categoryAnalysis = [
  { category: "Hostel", count: 45, trend: "+35%", priority: "high", avgResolution: 4.2 },
  { category: "IT Services", count: 38, trend: "+12%", priority: "medium", avgResolution: 3.1 },
  { category: "Canteen", count: 23, trend: "-8%", priority: "low", avgResolution: 2.8 },
  { category: "Library", count: 19, trend: "+5%", priority: "low", avgResolution: 1.9 },
  { category: "Infrastructure", count: 16, trend: "+22%", priority: "high", avgResolution: 5.6 },
]

const severityColors = {
  high: "border-red-500 bg-red-500/10",
  medium: "border-yellow-500 bg-yellow-500/10",
  low: "border-blue-500 bg-blue-500/10",
}

const severityTextColors = {
  high: "text-red-500",
  medium: "text-yellow-500",
  low: "text-blue-500",
}

export function AIAnalytics() {
  return (
    <div className="space-y-6">
      {/* AI Insights */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>Smart analysis and recommendations based on complaint patterns and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {aiInsights.map((insight, index) => (
              <div key={index} className={`p-4 rounded-lg border ${severityColors[insight.severity]}`}>
                <div className="flex items-start gap-3">
                  <insight.icon className={`w-5 h-5 mt-0.5 ${severityTextColors[insight.severity]}`} />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{insight.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {insight.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                    <div className="bg-background/50 p-3 rounded border">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">AI Recommendation</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.recommendation}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Analysis */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Smart Category Analysis</CardTitle>
          <CardDescription>AI-driven analysis of complaint categories with trend predictions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryAnalysis.map((category) => (
              <div
                key={category.category}
                className="flex items-center justify-between p-4 border border-border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{category.category}</h3>
                    <Badge
                      className={`text-xs ${
                        category.priority === "high"
                          ? "bg-red-500 text-white"
                          : category.priority === "medium"
                            ? "bg-yellow-500 text-white"
                            : "bg-green-500 text-white"
                      }`}
                    >
                      {category.priority} priority
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {category.count} complaints • Avg resolution: {category.avgResolution} days
                  </p>
                </div>
                <div className="text-right">
                  <div
                    className={`text-lg font-bold ${
                      category.trend.startsWith("+") ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {category.trend}
                  </div>
                  <p className="text-xs text-muted-foreground">vs last month</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Predictive Analytics */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Resolution Time Prediction
            </CardTitle>
            <CardDescription>AI-predicted resolution times for current complaints</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>High Priority Complaints</span>
                  <span>2.3 days avg</span>
                </div>
                <Progress value={75} className="h-2" />
                <p className="text-xs text-muted-foreground">15% faster than historical average</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Medium Priority Complaints</span>
                  <span>4.1 days avg</span>
                </div>
                <Progress value={60} className="h-2" />
                <p className="text-xs text-muted-foreground">On track with targets</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Low Priority Complaints</span>
                  <span>6.8 days avg</span>
                </div>
                <Progress value={45} className="h-2" />
                <p className="text-xs text-muted-foreground">8% slower than target</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-primary" />
              Risk Assessment
            </CardTitle>
            <CardDescription>AI-identified risks and preventive measures</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded">
                <h4 className="font-medium text-sm text-red-500 mb-1">High Risk</h4>
                <p className="text-xs text-muted-foreground">3 complaints may escalate due to approaching deadlines</p>
              </div>

              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                <h4 className="font-medium text-sm text-yellow-500 mb-1">Medium Risk</h4>
                <p className="text-xs text-muted-foreground">
                  IT Department workload may cause delays in new assignments
                </p>
              </div>

              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded">
                <h4 className="font-medium text-sm text-green-500 mb-1">Low Risk</h4>
                <p className="text-xs text-muted-foreground">
                  Overall system performance is within acceptable parameters
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
