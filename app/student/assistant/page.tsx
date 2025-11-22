import  StudentSidebar  from "@/components/student-sidebar"
import { AIChatbot } from "@/components/ai-chatbot"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Lightbulb, Target, Zap, Users, Shield, FileText, BarChart3, Clock, HelpCircle, Settings, TrendingUp } from "lucide-react"

const quickHelp = [
  {
    title: "Filing Your First Complaint",
    description: "Learn how to submit a complaint with proper categorization",
    icon: Target,
  },
  {
    title: "Understanding Priorities",
    description: "How to set the right priority level for faster resolution",
    icon: Zap,
  },
  {
    title: "Tracking Progress",
    description: "Monitor your complaint status and get real-time updates",
    icon: Brain,
  },
  {
    title: "Best Practices",
    description: "Tips for writing effective complaints that get resolved quickly",
    icon: Lightbulb,
  },
]

const websiteFeatures = [
  {
    title: "Complaint Management System",
    description: "Submit, track, and manage all your complaints in one place",
    icon: FileText,
    details: [
      "Submit complaints with detailed descriptions",
      "Attach supporting files and images",
      "Real-time status tracking",
      "Automatic staff assignment",
      "Due date tracking and notifications"
    ]
  },
  {
    title: "Staff Assignment & Escalation",
    description: "Smart assignment system with automatic escalation",
    icon: Users,
    details: [
      "Level 1 staff assignment by category",
      "Automatic escalation to Level 2 if unresolved",
      "Performance tracking for staff",
      "Category-based expert assignment"
    ]
  },
  {
    title: "Admin Dashboard",
    description: "Comprehensive management tools for administrators",
    icon: Shield,
    details: [
      "Real-time complaint monitoring",
      "Staff performance analytics",
      "Escalation queue management",
      "System-wide statistics and insights"
    ]
  },
  {
    title: "Rating & Feedback System",
    description: "Rate resolved complaints to help improve services",
    icon: TrendingUp,
    details: [
      "Post-resolution rating system",
      "Staff performance feedback",
      "Service quality monitoring",
      "Continuous improvement tracking"
    ]
  }
]

const complaintCategories = [
  {
    category: "Library",
    staff: "Library Assistant, Supervisor, Head Librarian",
    description: "Book availability, digital resources, facility issues"
  },
  {
    category: "Hostel",
    staff: "Assistant Warden, Hostel Warden", 
    description: "Room maintenance, amenities, roommate issues"
  },
  {
    category: "Academic",
    staff: "Academic Coordinator, Department Head",
    description: "Grade disputes, course materials, faculty issues"
  },
  {
    category: "Infrastructure",
    staff: "Maintenance Engineer, Civil Engineer",
    description: "WiFi, building maintenance, facility repairs"
  },
  {
    category: "Cafeteria", 
    staff: "Cafeteria Manager",
    description: "Food quality, hygiene, service issues"
  },
  {
    category: "Sports",
    staff: "Sports Coordinator",
    description: "Equipment, facilities, sports events"
  },
  {
    category: "General",
    staff: "General Administrator",
    description: "Other administrative and general issues"
  }
]

const prioritySystem = [
  {
    level: "Urgent",
    timeframe: "1 day",
    description: "Critical issues affecting safety or academics",
    examples: ["Safety hazards", "Health emergencies", "Critical academic deadlines"]
  },
  {
    level: "High", 
    timeframe: "2 days",
    description: "Important issues affecting multiple students",
    examples: ["WiFi outage", "Water leakage", "Multiple students affected"]
  },
  {
    level: "Medium",
    timeframe: "3 days", 
    description: "Standard complaints requiring attention",
    examples: ["Room maintenance", "Book requests", "General queries"]
  },
  {
    level: "Low",
    timeframe: "7 days",
    description: "Minor issues and general feedback",
    examples: ["Suggestions", "Minor repairs", "Non-urgent matters"]
  }
]

export default function AIAssistantPage() {
  return (
    <div className="min-h-screen gradient-bg">
      <StudentSidebar />

      <div className="lg:ml-64 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Assistant</h1>
            <p className="text-muted-foreground">
              Get comprehensive information about SolveIT complaint management system, process guidance, and smart recommendations
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AIChatbot />
            </div>

            <div className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Help Topics</CardTitle>
                  <CardDescription>Common questions and guidance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {quickHelp.map((item, index) => (
                      <div
                        key={index}
                        className="p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <item.icon className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <h3 className="font-medium text-sm">{item.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">System Overview</CardTitle>
                  <CardDescription>About SolveIT Platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">SolveIT Complaint System</h4>
                      <p className="text-xs text-muted-foreground">
                        College complaint management platform
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">12 Staff Members</h4>
                      <p className="text-xs text-muted-foreground">
                        Across 7 departments and categories
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Real-time Tracking</h4>
                      <p className="text-xs text-muted-foreground">
                        Live updates and status monitoring
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Performance Analytics</h4>
                      <p className="text-xs text-muted-foreground">
                        Staff performance and resolution metrics
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Complaint Categories</CardTitle>
                  <CardDescription>Available departments and staff</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {complaintCategories.map((cat, index) => (
                      <div key={index} className="p-2 border border-border/50 rounded text-sm">
                        <div className="font-medium text-foreground">{cat.category}</div>
                        <div className="text-xs text-muted-foreground">Staff: {cat.staff}</div>
                        <div className="text-xs text-muted-foreground mt-1">{cat.description}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Priority System</CardTitle>
                  <CardDescription>Resolution timeframes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {prioritySystem.map((priority, index) => (
                      <div key={index} className="p-2 border border-border/50 rounded text-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-foreground">{priority.level}</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {priority.timeframe}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{priority.description}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Key Features</CardTitle>
                  <CardDescription>What SolveIT offers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Smart staff assignment by category</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Automatic escalation system</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Real-time status updates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>File attachment support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Post-resolution rating system</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Admin dashboard with analytics</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Need Help?</CardTitle>
                  <CardDescription>Common questions answered</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                      <div className="font-medium text-blue-800">How to submit a complaint?</div>
                      <div className="text-xs text-blue-700 mt-1">
                        Go to Complaint Form, fill details, select category, and submit
                      </div>
                    </div>
                    <div className="p-2 bg-green-50 border border-green-200 rounded">
                      <div className="font-medium text-green-800">How to check status?</div>
                      <div className="text-xs text-green-700 mt-1">
                        Visit Dashboard to see all your complaints and their status
                      </div>
                    </div>
                    <div className="p-2 bg-purple-50 border border-purple-200 rounded">
                      <div className="font-medium text-purple-800">When can I rate?</div>
                      <div className="text-xs text-purple-700 mt-1">
                        Rating is available only after complaint is resolved
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {websiteFeatures.map((feature, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{feature.title}</CardTitle>
                      <CardDescription className="text-xs">{feature.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {feature.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-primary rounded-full mt-2"></div>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}