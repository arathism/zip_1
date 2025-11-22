import { AdminSidebar } from "@/components/admin-sidebar"
import { AIAnalytics } from "@/components/ai-analytics"

export default function AdminAnalyticsPage() {
  return (
    <div className="min-h-screen gradient-bg">
      <AdminSidebar />

      <div className="lg:ml-64 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Analytics & Insights</h1>
            <p className="text-muted-foreground">
              Advanced AI-powered analysis of complaint patterns, trends, and performance predictions
            </p>
          </div>

          <AIAnalytics />
        </div>
      </div>
    </div>
  )
}
