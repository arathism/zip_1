"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Search, Filter, Plus, Calendar, Clock, AlertTriangle, CheckCircle, User } from "lucide-react"

// Extended Complaint type with overdue properties
interface ExtendedComplaint {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  dueDate: string;
  submittedBy: string;
  studentName: string;
  studentEmail: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  escalationLevel?: number;
  attachments?: string[];
  remarks?: string;
  resolution?: string;
  rating?: number;
  feedback?: string;
  isOverdue?: boolean;
  daysOverdue?: number;
}

// Helper functions
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

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />
    case 'in-progress': return <Clock className="w-4 h-4 text-blue-500" />
    case 'assigned': return <FileText className="w-4 h-4 text-yellow-500" />
    case 'pending': return <FileText className="w-4 h-4 text-gray-500" />
    default: return <FileText className="w-4 h-4 text-gray-500" />
  }
}

const getRemainingDays = (dueDate: string): number => {
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default function AllComplaintsPage() {
  const [allComplaints, setAllComplaints] = useState<ExtendedComplaint[]>([])
  const [filteredComplaints, setFilteredComplaints] = useState<ExtendedComplaint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const router = useRouter()

  useEffect(() => {
    loadAllComplaints()
  }, [])

  useEffect(() => {
    filterComplaints()
  }, [allComplaints, searchTerm, statusFilter, priorityFilter])

  const loadAllComplaints = async () => {
    try {
      setIsLoading(true)
      
      // Get staff info
      const userData = JSON.parse(localStorage.getItem("user") || '{}')
      const staffId = userData.id
      const staffName = userData.name
      const staffCategory = userData.category
      
      // Get all complaints for this staff
      const allComplaintsData = JSON.parse(localStorage.getItem('staffAllComplaints') || '[]')
      
      if (allComplaintsData.length === 0) {
        // If no data in staffAllComplaints, fetch from studentComplaints
        const studentComplaints = JSON.parse(localStorage.getItem('studentComplaints') || '[]')
        const filtered = studentComplaints.filter((comp: any) => 
          comp.category === staffCategory ||
          comp.assignedStaffId === staffId || 
          comp.assignedStaffName === staffName ||
          comp.assignedTo === staffName
        )
        
        // Convert to ExtendedComplaint format
        const now = new Date()
        const formattedComplaints: ExtendedComplaint[] = filtered.map((comp: any) => {
          const dueDate = new Date(comp.dueDate)
          const isOverdue = dueDate < now && ['pending', 'assigned', 'in-progress'].includes(comp.status)
          const daysOverdue = isOverdue ? Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0
          
          return {
            _id: comp.id || comp._id,
            title: comp.title,
            description: comp.description,
            category: comp.category,
            priority: comp.priority,
            status: comp.status,
            dueDate: comp.dueDate,
            submittedBy: comp.studentId || comp.submittedBy,
            studentName: comp.studentName,
            studentEmail: comp.studentEmail,
            assignedTo: comp.assignedTo || comp.assignedStaffName || 'Unassigned',
            createdAt: comp.createdAt,
            updatedAt: comp.updatedAt,
            escalationLevel: comp.escalationLevel || 0,
            attachments: comp.attachments || [],
            remarks: comp.remarks,
            resolution: comp.resolution,
            rating: comp.rating,
            feedback: comp.feedback,
            isOverdue: isOverdue,
            daysOverdue: daysOverdue
          }
        })
        
        setAllComplaints(formattedComplaints.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
      } else {
        setAllComplaints(allComplaintsData.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
      }
      
    } catch (error) {
      console.error('❌ Error loading all complaints:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterComplaints = () => {
    let filtered = allComplaints

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(comp => 
        comp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(comp => comp.status === statusFilter)
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(comp => comp.priority === priorityFilter)
    }

    setFilteredComplaints(filtered)
  }

  const getComplaintStats = () => {
    const total = allComplaints.length
    const assigned = allComplaints.filter(c => c.assignedTo !== 'Unassigned').length
    const unassigned = allComplaints.filter(c => c.assignedTo === 'Unassigned').length
    const resolved = allComplaints.filter(c => c.status === 'resolved').length
    
    return { total, assigned, unassigned, resolved }
  }

  const stats = getComplaintStats()

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-12 h-12 text-primary animate-pulse mx-auto" />
          <p className="mt-4 text-lg text-foreground">Loading All Complaints...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push("/staff/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">All Complaints</h1>
              <p className="text-muted-foreground">Manage and view all complaints in your category</p>
            </div>
          </div>
          <Button onClick={loadAllComplaints}>
            <FileText className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <p className="text-sm text-muted-foreground">Total Complaints</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{stats.assigned}</div>
              <p className="text-sm text-muted-foreground">Assigned</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">{stats.unassigned}</div>
              <p className="text-sm text-muted-foreground">Unassigned</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background/50"
                />
              </div>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-background/50"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
              <select 
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-background/50"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <Button onClick={loadAllComplaints} variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Complaints List */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">
              {filteredComplaints.length} Complaint{filteredComplaints.length !== 1 ? 's' : ''} Found
            </CardTitle>
            <CardDescription>
              Showing all complaints in your category and assigned to you
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredComplaints.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No complaints found</p>
                <p className="text-sm mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredComplaints.map((complaint) => {
                  const remainingDays = getRemainingDays(complaint.dueDate)
                  const isOverdue = remainingDays < 0
                  
                  return (
                    <div key={complaint._id} className={`flex items-center justify-between p-4 border rounded-lg backdrop-blur-sm hover:shadow-md transition-shadow ${
                      isOverdue ? 'border-red-200 bg-red-50/30' : 'border-border/50 bg-card/30'
                    }`}>
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority.toUpperCase()}
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                          {getStatusIcon(complaint.status)}
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{complaint.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {complaint.category} • {complaint.studentName} • 
                              Created: {new Date(complaint.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs mt-1 flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full ${getStatusColor(complaint.status)}`}>
                                {complaint.status.toUpperCase()}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {complaint.assignedTo}
                              </span>
                              {isOverdue ? (
                                <span className="text-red-600">
                                  ⚠️ {Math.abs(remainingDays)} day{Math.abs(remainingDays) > 1 ? 's' : ''} overdue
                                </span>
                              ) : (
                                <span className="text-green-600">
                                  📅 {remainingDays} day{remainingDays > 1 ? 's' : ''} remaining
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => router.push(`/staff/complaints/${complaint._id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}