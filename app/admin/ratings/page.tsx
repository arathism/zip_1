import { AdminSidebar } from "@/components/admin-sidebar"
import { AuthorityPerformance } from "@/components/authority-performance"

export default function AuthorityRatingsPage() {
  return (
    <div className="min-h-screen gradient-bg">
      <AdminSidebar />

      <div className="lg:ml-64 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Authority Performance & Ratings</h1>
            <p className="text-muted-foreground">
              Monitor authority performance metrics, student ratings, and resolution efficiency
            </p>
          </div>

          <AuthorityPerformance />
        </div>
      </div>
    </div>
  )
}
