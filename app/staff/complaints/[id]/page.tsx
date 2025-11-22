"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Brain, LogOut, FileText, CheckCircle, Clock, AlertTriangle, User, Mail, Calendar, ArrowLeft, Save, MessageSquare, Star } from "lucide-react"
import { Complaint } from "@/types"
import { dummyComplaints } from "@/lib/dummy-data"

export default function ComplaintDetail() {
  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [remarks, setRemarks] = useState("")
  const [resolution, setResolution] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const complaintId = params.id as string

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/auth/login")
      return
    }

    // Find the complaint from dummy data
    const foundComplaint = dummyComplaints.find(comp => comp._id === complaintId)
    if (foundComplaint) {
      setComplaint(foundComplaint)
      setRemarks(foundComplaint.remarks || "")
      setResolution(foundComplaint.resolution || "")
    } else {
      // Redirect if complaint not found
      router.push("/staff/complaints")
    }
    
    setIsLoading(false)
  }, [complaintId, router])

  const handleUpdateStatus = async (newStatus: Complaint['status']) => {
    if (!complaint) return

    try {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const updatedComplaint = {
        ...complaint,
        status: newStatus,
        updatedAt: new Date().toISOString(),
        remarks: remarks || complaint.remarks,
        resolution: resolution || complaint.resolution
      }
      
      setComplaint(updatedComplaint)
      alert(`Complaint status updated to ${newStatus}`)
    } catch (error) {
      console.error('Error updating complaint:', error)
      alert('Error updating complaint. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveRemarks = async () => {
    if (!complaint) return

    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setComplaint(prev => prev ? { ...prev, remarks } : null)
      alert('Remarks saved successfully!')
    } catch (error) {
      console.error('Error saving remarks:', error)
      alert('Error saving remarks. Please try again.')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-600 bg-green-50'
      case 'in-progress': return 'text-blue-600 bg-blue-50'
      case 'assigned': return 'text-yellow-600 bg-yellow-50'
      case 'pending': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 text-primary animate-pulse mx-auto" />
          <p className="mt-4 text-lg text-foreground">Loading Complaint Details...</p>
        </div>
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-foreground">Complaint not found</p>
              <Button onClick={() => router.push("/staff/complaints")} className="mt-4">
                Back to Complaints
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg">
      <header className="bg-card/50 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => router.push("/staff/complaints")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Brain className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Complaint Details</h1>
                <p className="text-sm text-muted-foreground">Manage and update complaint information</p>
              </div>
            </div>
            <Button onClick={() => router.push("/staff/complaints")}>
              All Complaints
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Complaint Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Complaint Header */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-foreground text-2xl mb-2">{complaint.title}</CardTitle>
                    <CardDescription className="text-lg">{complaint.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority.toUpperCase()}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(complaint.status)}`}>
                      {complaint.status.replace('-', ' ').toUpperCase()}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <p className="font-medium text-foreground">{complaint.category}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Due Date:</span>
                    <p className="font-medium text-foreground">{new Date(complaint.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Submitted:</span>
                    <p className="font-medium text-foreground">{new Date(complaint.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Updated:</span>
                    <p className="font-medium text-foreground">{new Date(complaint.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {complaint.escalationLevel > 0 && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="font-medium text-red-800">
                        This complaint has been escalated to Level {complaint.escalationLevel}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Student Information */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <User className="w-5 h-5" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">{complaint.studentName}</p>
                      <p className="text-sm text-muted-foreground">Student</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">{complaint.studentEmail}</p>
                      <p className="text-sm text-muted-foreground">Email</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Remarks Section */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <MessageSquare className="w-5 h-5" />
                  Remarks & Updates
                </CardTitle>
                <CardDescription>
                  Add remarks and track progress for this complaint
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="remarks" className="text-foreground">Current Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add remarks about the complaint progress..."
                    className="min-h-[100px] bg-card/30"
                  />
                </div>
                <Button onClick={handleSaveRemarks} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Remarks
                </Button>

                {complaint.remarks && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-800">
                      <strong>Current Remarks:</strong> {complaint.remarks}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resolution Section */}
            {complaint.status === 'resolved' && complaint.resolution && (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Resolution Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground">{complaint.resolution}</p>
                  {complaint.rating && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-muted-foreground">Student Rating:</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i}
                            className={`w-4 h-4 ${
                              i < complaint.rating! ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm text-muted-foreground">({complaint.rating}/5)</span>
                      </div>
                    </div>
                  )}
                  {complaint.feedback && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm text-green-800">
                        <strong>Student Feedback:</strong> {complaint.feedback}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Actions */}
          <div className="space-y-6">
            {/* Status Actions */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground">Update Status</CardTitle>
                <CardDescription>Change the current status of this complaint</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant={complaint.status === 'assigned' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => handleUpdateStatus('assigned')}
                  disabled={isLoading}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Mark as Assigned
                </Button>
                <Button 
                  variant={complaint.status === 'in-progress' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => handleUpdateStatus('in-progress')}
                  disabled={isLoading}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Mark In Progress
                </Button>
                <Button 
                  variant={complaint.status === 'resolved' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => handleUpdateStatus('resolved')}
                  disabled={isLoading}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Resolved
                </Button>
              </CardContent>
            </Card>

            {/* Complaint Information */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground">Complaint Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Priority:</span>
                  <span className="font-medium text-foreground capitalize">{complaint.priority}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium text-foreground">{complaint.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium text-foreground capitalize">{complaint.status.replace('-', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date:</span>
                  <span className="font-medium text-foreground">{new Date(complaint.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Days Remaining:</span>
                  <span className={`font-medium ${
                    new Date(complaint.dueDate) < new Date() ? 'text-red-600' : 'text-foreground'
                  }`}>
                    {Math.ceil((new Date(complaint.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Student
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <User className="w-4 h-4 mr-2" />
                  Request Escalation
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Follow-up
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}