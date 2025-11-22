// app/student/complaints/[id]/page.tsx
"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import StudentSidebar from '@/components/student-sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, User, FileText, Clock } from 'lucide-react'

interface Complaint {
  _id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  createdAt: string
  dueDate?: string
  assignedStaffName?: string
  studentName: string
  studentCollegeId: string
  location?: string
  escalationLevel: number
}

export default function ComplaintDetails() {
  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const params = useParams()
  const router = useRouter()
  const complaintId = params.id as string

  useEffect(() => {
    fetchComplaintDetails()
  }, [complaintId])

  const fetchComplaintDetails = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch(`/api/complaints/${complaintId}`)
      if (response.ok) {
        const data = await response.json()
        setComplaint(data.complaint)
      }
    } catch (error) {
      console.error('Failed to fetch complaint details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!complaint) {
    return <div>Complaint not found</div>
  }

  return (
    <div className="min-h-screen gradient-bg">
      <StudentSidebar />
      <div className="lg:ml-64 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Complaints
          </Button>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl mb-2">{complaint.title}</CardTitle>
                  <CardDescription className="text-lg">
                    {complaint.description}
                  </CardDescription>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge className={`${getStatusColor(complaint.status)} text-white`}>
                    {complaint.status.replace('-', ' ')}
                  </Badge>
                  <Badge className={`${getPriorityColor(complaint.priority)} text-white`}>
                    {complaint.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Student</p>
                      <p className="font-medium">{complaint.studentName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-medium">{complaint.category}</p>
                    </div>
                  </div>

                  {complaint.assignedStaffName && (
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Assigned To</p>
                        <p className="font-medium">{complaint.assignedStaffName}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="font-medium">
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {complaint.dueDate && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Due Date</p>
                        <p className="font-medium">
                          {new Date(complaint.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {complaint.location && (
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">{complaint.location}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">Additional Information</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">College ID</p>
                    <p className="font-medium">{complaint.studentCollegeId}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Escalation Level</p>
                    <p className="font-medium">Level {complaint.escalationLevel}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Add these helper functions
const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  "in-progress": "bg-blue-500",
  resolved: "bg-green-500",
  rejected: "bg-red-500"
}

const priorityColors: Record<string, string> = {
  low: "bg-green-500",
  medium: "bg-yellow-500",
  high: "bg-red-500",
  urgent: "bg-purple-500"
}

const getStatusColor = (status: string): string => {
  return statusColors[status] || "bg-gray-500";
}

const getPriorityColor = (priority: string): string => {
  return priorityColors[priority] || "bg-gray-500";
}