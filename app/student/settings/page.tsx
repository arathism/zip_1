import { StudentSidebar } from "@/components/student-sidebar"
import { StudentSettings } from "@/components/student-settings"

export default function StudentSettingsPage() {
  return (
    <div className="min-h-screen gradient-bg">
      <StudentSidebar />

      <div className="lg:ml-64 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">
              Customize your notification preferences, appearance, and security settings
            </p>
          </div>

          <StudentSettings />
        </div>
      </div>
    </div>
  )
}
