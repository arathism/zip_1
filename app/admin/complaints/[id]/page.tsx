"use client"

import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, User, Mail, Phone, Building, Star, AlertCircle, Clock, CheckCircle, FileText, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

interface Complaint {
  id: string;
  _id?: string;
  title: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'escalated';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  overdue: boolean;
  category: string;
  description: string;
  studentCollegeId?: string;
  assignedStaffName?: string;
  assignedStaffId?: string;
  dueDate?: string;
  studentRating?: number;
  studentFeedback?: string;
  escalatedFromStaff?: string;
  escalationReason?: string;
  originalStaffName?: string;
  escalationLevel?: 'junior' | 'senior' | 'manager' | 'director';
  escalatedToStaff?: string;
  escalationNotes?: string;
  source?: 'student' | 'staff';
}

interface Staff {
  id: string;
  _id?: string;
  name: string;
  email: string;
  department: string;
  category: string;
  isActive: boolean;
  currentWorkload: number;
  performanceScore: number;
  role?: string;
  phone?: string;
  level?: 'junior' | 'senior' | 'manager' | 'director';
}

const statusColors = {
  pending: "bg-yellow-500",
  "in-progress": "bg-blue-500",
  resolved: "bg-green-500",
  escalated: "bg-red-500",
}

const priorityColors = {
  low: "bg-green-500",
  medium: "bg-yellow-500",
  high: "bg-red-500",
}

const categoryColors: { [key: string]: string } = {
  library: "bg-blue-100 text-blue-800",
  hostel: "bg-purple-100 text-purple-800",
  academic: "bg-green-100 text-green-800",
  infrastructure: "bg-orange-100 text-orange-800",
  cafeteria: "bg-red-100 text-red-800",
  sports: "bg-indigo-100 text-indigo-800",
  general: "bg-gray-100 text-gray-800"
}

const staffLevelDisplayNames: { [key: string]: string } = {
  junior: "Junior Staff",
  senior: "Senior Staff",
  manager: "Manager",
  director: "Director"
}

export default function ComplaintDetailsPage() {
  const params = useParams()
  const complaintId = params.id as string
  
  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [escalating, setEscalating] = useState(false)

  useEffect(() => {
    fetchComplaintDetails()
    fetchStaffData()
  }, [complaintId])

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true)
      // Try to fetch from API first
      const response = await fetch(`/api/complaints/${complaintId}`)
      if (response.ok) {
        const data = await response.json()
        setComplaint(data)
      } else {
        // Fallback to localStorage or mock data
        await fallbackToStoredData()
      }
    } catch (error) {
      console.error('Error fetching complaint details:', error)
      await fallbackToStoredData()
    } finally {
      setLoading(false)
    }
  }

  const fallbackToStoredData = async () => {
    // Try to get from localStorage
    const storedComplaints = localStorage.getItem('complaints')
    if (storedComplaints) {
      const complaints = JSON.parse(storedComplaints)
      const foundComplaint = complaints.find((c: any) => c.id === complaintId || c._id === complaintId)
      if (foundComplaint) {
        setComplaint(foundComplaint)
        return
      }
    }
    
    // Use mock data as last resort
    setComplaint(getMockComplaintData())
  }

  const fetchStaffData = async () => {
    try {
      const response = await fetch('/api/staff')
      if (response.ok) {
        let staffData = await response.json()
        if (staffData.success && staffData.data) {
          staffData = staffData.data
        }
        // Enhance staff data with levels
        const enhancedStaff = staffData.map((staff: any) => ({
          ...staff,
          level: getStaffLevelFromRole(staff.role)
        }))
        setAvailableStaff(enhancedStaff)
      }
    } catch (error) {
      console.error('Error fetching staff data:', error)
    }
  }

  const getStaffLevelFromRole = (role: string): string => {
    const roleLower = role.toLowerCase();
    if (roleLower.includes('director') || roleLower.includes('head')) return 'director';
    if (roleLower.includes('manager') || roleLower.includes('supervisor')) return 'manager';
    if (roleLower.includes('senior') || roleLower.includes('coordinator')) return 'senior';
    return 'junior';
  }

  const getMockComplaintData = (): Complaint => {
    return {
      id: complaintId,
      title: 'Library AC not working',
      status: 'escalated',
      priority: 'high',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      studentName: 'Alice Johnson',
      studentEmail: 'alice.johnson@college.edu',
      studentPhone: '+91-9876543210',
      overdue: false,
      category: 'library',
      description: 'The air conditioning in the library reading room is not functioning properly. Students are facing difficulty studying due to the heat. The issue has been persistent for 3 days now.',
      studentCollegeId: 'COL2024001',
      assignedStaffName: 'Library Supervisor',
      escalatedFromStaff: 'Library Assistant',
      escalationReason: 'Requires budget approval for AC repair and technical expertise',
      originalStaffName: 'Library Assistant',
      escalationLevel: 'senior',
      escalatedToStaff: 'Library Supervisor',
      escalationNotes: 'Initial assessment done by junior staff. Requires senior approval for budget allocation.',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'student'
    }
  }

  const escalateComplaintToHigherLevel = async () => {
    if (!complaint) return

    try {
      setEscalating(true)
      const currentLevel = complaint.escalationLevel || 'junior'
      const escalationLevels = ['junior', 'senior', 'manager', 'director']
      const currentIndex = escalationLevels.indexOf(currentLevel)
      const nextLevel = currentIndex < escalationLevels.length - 1 ? escalationLevels[currentIndex + 1] : 'director'

      // Find available staff at next level
      const nextLevelStaff = availableStaff.filter(staff => 
        staff.isActive && 
        (staff.department === complaint.category || staff.category === complaint.category) &&
        staff.level === nextLevel
      ).sort((a, b) => a.currentWorkload - b.currentWorkload)

      if (nextLevelStaff.length === 0) {
        alert(`No ${nextLevel} level staff available for ${complaint.category}`)
        return
      }

      const selectedStaff = nextLevelStaff[0]
      
      // Update complaint
      const updateResponse = await fetch('/api/complaints/escalate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          complaintId: complaint.id,
          staffId: selectedStaff.id,
          escalationLevel: nextLevel,
          notes: `Escalated to ${staffLevelDisplayNames[nextLevel]} level`
        })
      })

      if (updateResponse.ok) {
        // Update local state
        setComplaint(prev => prev ? {
          ...prev,
          escalationLevel: nextLevel as any,
          escalatedToStaff: selectedStaff.name,
          assignedStaffName: selectedStaff.name,
          status: 'in-progress'
        } : null)
        
        // Show success message
        alert(`Complaint escalated to ${selectedStaff.name} (${staffLevelDisplayNames[nextLevel]})`)
      }
    } catch (error) {
      console.error('Error escalating complaint:', error)
      alert('Failed to escalate complaint')
    } finally {
      setEscalating(false)
    }
  }

  const getNextLevelStaff = () => {
    if (!complaint) return []
    const currentLevel = complaint.escalationLevel || 'junior'
    const escalationLevels = ['junior', 'senior', 'manager', 'director']
    const currentIndex = escalationLevels.indexOf(currentLevel)
    const nextLevel = currentIndex < escalationLevels.length - 1 ? escalationLevels[currentIndex + 1] : 'director'

    return availableStaff.filter(staff => 
      staff.isActive && 
      (staff.department === complaint.category || staff.category === complaint.category) &&
      staff.level === nextLevel
    ).sort((a, b) => a.currentWorkload - b.currentWorkload)
  }

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-lg font-medium ml-2">{rating}.0</span>
      </div>
    )
  }

  const renderEscalationLevel = (level?: string) => {
    if (!level) return null
    
    const levelColors = {
      junior: "bg-green-100 text-green-800 border-green-200",
      senior: "bg-blue-100 text-blue-800 border-blue-200",
      manager: "bg-purple-100 text-purple-800 border-purple-200",
      director: "bg-red-100 text-red-800 border-red-200"
    }

    return (
      <Badge className={`${levelColors[level as keyof typeof levelColors] || 'bg-gray-100 text-gray-800'} text-sm py-1 px-3 border`}>
        {staffLevelDisplayNames[level as keyof typeof staffLevelDisplayNames] || level}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg">
        <AdminSidebar />
        <div className="lg:ml-64 p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-lg text-muted-foreground">Loading complaint details...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="min-h-screen gradient-bg">
        <AdminSidebar />
        <div className="lg:ml-64 p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Complaint Not Found</h2>
              <p className="text-muted-foreground mb-6">The complaint you're looking for doesn't exist.</p>
              <Link href="/admin">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const nextLevelStaff = getNextLevelStaff()
  const canEscalate = nextLevelStaff.length > 0 && complaint.status === 'escalated'

  return (
    <div className="min-h-screen gradient-bg">
      <AdminSidebar />

      <div className="lg:ml-64 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Complaint Details</h1>
                <p className="text-muted-foreground">Complaint ID: {complaint.id}</p>
              </div>
            </div>
            
            {canEscalate && (
              <Button 
                onClick={escalateComplaintToHigherLevel}
                disabled={escalating}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                {escalating ? 'Escalating...' : `Escalate to ${staffLevelDisplayNames[nextLevelStaff[0].level || 'senior']}`}
              </Button>
            )}
          </div>

          {/* Main Complaint Card */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="space-y-2">
                  <CardTitle className="text-2xl">{complaint.title}</CardTitle>
                  <CardDescription className="text-lg">
                    {complaint.description}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={`${statusColors[complaint.status]} text-white text-sm py-1 px-3`}>
                    {complaint.status.toUpperCase()}
                  </Badge>
                  <Badge className={`${priorityColors[complaint.priority]} text-white text-sm py-1 px-3`}>
                    {complaint.priority.toUpperCase()} PRIORITY
                  </Badge>
                  <Badge className={`${categoryColors[complaint.category] || categoryColors.general} text-sm py-1 px-3`}>
                    {complaint.category.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Student Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Student Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{complaint.studentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{complaint.studentEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">{complaint.studentPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">College ID:</span>
                      <span className="font-medium">{complaint.studentCollegeId}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Complaint Timeline
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium">{new Date(complaint.createdAt).toLocaleDateString()}</span>
                    </div>
                    {complaint.dueDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Due Date:</span>
                        <span className="font-medium">{new Date(complaint.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Overdue:</span>
                      <Badge variant={complaint.overdue ? "destructive" : "secondary"}>
                        {complaint.overdue ? "YES" : "NO"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Staff Assignment & Escalation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Staff Assignment</h3>
                  <div className="space-y-2">
                    {complaint.assignedStaffName && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Currently Assigned:</span>
                        <span className="font-medium">{complaint.assignedStaffName}</span>
                      </div>
                    )}
                    {complaint.escalationLevel && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Level:</span>
                        {renderEscalationLevel(complaint.escalationLevel)}
                      </div>
                    )}
                  </div>
                </div>

                {complaint.status === 'escalated' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-red-600">Escalation Details</h3>
                    <div className="space-y-2">
                      {complaint.escalatedFromStaff && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Escalated By:</span>
                          <span className="font-medium text-red-600">{complaint.escalatedFromStaff}</span>
                        </div>
                      )}
                      {complaint.originalStaffName && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Originally Assigned:</span>
                          <span className="font-medium">{complaint.originalStaffName}</span>
                        </div>
                      )}
                      {complaint.escalationReason && (
                        <div>
                          <div className="text-muted-foreground mb-1">Escalation Reason:</div>
                          <div className="bg-red-50 border border-red-200 rounded p-3">
                            <p className="text-sm text-red-800">{complaint.escalationReason}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Student Rating (if resolved) */}
              {complaint.status === 'resolved' && complaint.studentRating && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Student Feedback
                  </h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      {renderStarRating(complaint.studentRating)}
                      <Badge className="bg-green-500 text-white">RESOLVED</Badge>
                    </div>
                    {complaint.studentFeedback && (
                      <p className="text-green-800 mt-2">"{complaint.studentFeedback}"</p>
                    )}
                  </div>
                </div>
              )}

              {/* Next Escalation Options */}
              {canEscalate && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Next Escalation Options</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {nextLevelStaff.map((staff) => (
                      <Card key={staff.id} className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="font-medium">{staff.name}</div>
                            <div className="text-sm text-muted-foreground">{staff.role}</div>
                            <div className="text-sm">
                              <Badge variant="outline" className="text-xs">
                                {staffLevelDisplayNames[staff.level || 'junior']}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Workload: {staff.currentWorkload} tasks
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Performance: {staff.performanceScore}%
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}