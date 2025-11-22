import  StudentSidebar  from "@/components/student-sidebar"
import { ComplaintList } from "@/components/complaint-list"

export default function ComplaintsPage() {
  return (
    <div className="min-h-screen gradient-bg">
      <StudentSidebar />

      <div className="lg:ml-64 p-4 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Complaints</h1>
            <p className="text-muted-foreground">Track the status and progress of all your submitted complaints</p>
          </div>

          <ComplaintList />
        </div>
      </div>
    </div>
  )
}
