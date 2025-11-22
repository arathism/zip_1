import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminProfile } from "@/components/admin-profile"

export default function AdminProfilePage() {
  return (
    <div className="min-h-screen gradient-bg">
      <AdminSidebar />

      <div className="lg:ml-64 p-4 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Authority Profile</h1>
            <p className="text-muted-foreground">
              Manage your profile information and view your performance statistics
            </p>
          </div>

          <AdminProfile />
        </div>
      </div>
    </div>
  )
}
