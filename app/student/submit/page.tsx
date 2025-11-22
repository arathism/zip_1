import  StudentSidebar  from "@/components/student-sidebar"
import { ComplaintForm } from "@/components/complaint-form"

export default function SubmitComplaintPage() {
  return (
    <div className="min-h-screen gradient-bg">
      <StudentSidebar />

      <div className="lg:ml-64 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Submit New Complaint</h1>
            <p className="text-muted-foreground">
              Report your issue and our AI will help categorize and route it to the right department
            </p>
          </div>

          <ComplaintForm />
        </div>
      </div>
    </div>
  )
}
