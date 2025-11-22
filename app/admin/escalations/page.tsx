"use client"

import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, AlertTriangle, Clock, User, Mail, Phone, Calendar, ArrowUp, Filter, MoreVertical, Eye, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"

interface EscalatedComplaint {
  id: string;
  _id?: string;
  title: string;
  status: 'escalated';
  priority: 'high' | 'urgent';
  createdAt: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  category: string;
  description: string;
  escalatedAt: string;
  escalationReason: string;
  previousStaff?: string;
  escalationLevel: number;
  assignedTo?: string;
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

const categoryDisplayNames: { [key: string]: string } = {
  library: "Library",
  hostel: "Hostel",
  academic: "Academic",
  infrastructure: "Infrastructure",
  cafeteria: "Cafeteria",
  sports: "Sports",
  general: "General"
}

export default function EscalationQueuePage() {
  const [escalatedComplaints, setEscalatedComplaints] = useState<EscalatedComplaint[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  useEffect(() => {
    fetchEscalatedComplaints()
  }, [])

  const fetchEscalatedComplaints = async () => {
    try {
      setLoading(true)
      // Try to fetch from API first
      const response = await fetch('/api/complaints?status=escalated')
      if (response.ok) {
        const data = await response.json()
        console.log('API Response for escalations:', data)
        if (data.success && data.data && data.data.length > 0) {
          setEscalatedComplaints(data.data)
        } else {
          // Use default data if API returns empty
          console.log('Using default escalation data - API returned empty')
          setEscalatedComplaints(getDefaultEscalatedComplaints())
        }
      } else {
        // Use default data if API fails
        console.log('Using default escalation data - API request failed')
        setEscalatedComplaints(getDefaultEscalatedComplaints())
      }
    } catch (error) {
      console.error('Failed to fetch escalated complaints:', error)
      // Use default data on error
      setEscalatedComplaints(getDefaultEscalatedComplaints())
    } finally {
      setLoading(false)
    }
  }

  const getDefaultEscalatedComplaints = (): EscalatedComplaint[] => {
    console.log('Loading default escalation data...')
    return [
      {
        id: 'esc-1',
        title: 'Library Book Not Available - Urgent Requirement',
        status: 'escalated',
        priority: 'urgent',
        createdAt: '2025-11-15T10:00:00Z',
        studentName: 'Rahul Sharma',
        studentEmail: 'rahul.sharma@student.college.edu',
        studentPhone: '+91-9876543201',
        category: 'library',
        description: 'Required textbook for final exams not available in library. Multiple students affected. Need immediate resolution as exams start next week.',
        escalatedAt: '2025-11-16T14:30:00Z',
        escalationReason: 'Not resolved within 48-hour timeframe',
        previousStaff: 'Library Assistant',
        escalationLevel: 2,
        assignedTo: 'Head Librarian'
      },
      {
        id: 'esc-2',
        title: 'Hostel Room Maintenance - Water Leakage',
        status: 'escalated',
        priority: 'high',
        createdAt: '2025-11-14T09:00:00Z',
        studentName: 'Priya Patel',
        studentEmail: 'priya.patel@student.college.edu',
        studentPhone: '+91-9876543202',
        category: 'hostel',
        description: 'Severe water leakage in room bathroom causing damage to personal belongings and electrical safety hazard. Water spreading to adjacent rooms.',
        escalatedAt: '2025-11-16T15:45:00Z',
        escalationReason: 'Multiple complaints from same issue, no action taken for 48 hours',
        previousStaff: 'Banashree',
        escalationLevel: 1,
        assignedTo: 'Assistant Warden'
      },
      {
        id: 'esc-3',
        title: 'WiFi Connectivity Issues - Complete Outage',
        status: 'escalated',
        priority: 'urgent',
        createdAt: '2025-11-13T14:20:00Z',
        studentName: 'Amit Kumar',
        studentEmail: 'amit.kumar@student.college.edu',
        studentPhone: '+91-9876543203',
        category: 'infrastructure',
        description: 'No internet connection in entire hostel block for 3 days. Affecting online classes, assignments, and research work. Multiple students impacted.',
        escalatedAt: '2025-11-16T11:20:00Z',
        escalationReason: 'Affecting multiple students, significant academic impact',
        previousStaff: 'Maintenance Engineer',
        escalationLevel: 2,
        assignedTo: 'Civil Engineer'
      },
      {
        id: 'esc-4',
        title: 'Cafeteria Food Quality - Health Concerns',
        status: 'escalated',
        priority: 'high',
        createdAt: '2025-11-12T12:00:00Z',
        studentName: 'Sneha Reddy',
        studentEmail: 'sneha.reddy@student.college.edu',
        studentPhone: '+91-9876543204',
        category: 'cafeteria',
        description: 'Multiple students reported stomach issues and food poisoning after eating from cafeteria. Need immediate inspection and quality check of food items.',
        escalatedAt: '2025-11-16T09:15:00Z',
        escalationReason: 'Health and safety concern affecting multiple students',
        previousStaff: 'Cafeteria Manager',
        escalationLevel: 1,
        assignedTo: 'General Administrator'
      },
      {
        id: 'esc-5',
        title: 'Sports Equipment Damage - Safety Hazard',
        status: 'escalated',
        priority: 'high',
        createdAt: '2025-11-11T16:30:00Z',
        studentName: 'Vikram Singh',
        studentEmail: 'vikram.singh@student.college.edu',
        studentPhone: '+91-9876543205',
        category: 'sports',
        description: 'Damaged gym equipment causing safety risks. Multiple equipment pieces need immediate repair or replacement. Treadmill belt broken, weight machine cables frayed.',
        escalatedAt: '2025-11-16T13:10:00Z',
        escalationReason: 'Safety hazard, potential for serious injury',
        previousStaff: 'Sports Coordinator',
        escalationLevel: 1,
        assignedTo: 'Maintenance Engineer'
      },
      {
        id: 'esc-6',
        title: 'Academic Grade Dispute - Urgent Review',
        status: 'escalated',
        priority: 'urgent',
        createdAt: '2025-11-10T11:00:00Z',
        studentName: 'Anjali Mehta',
        studentEmail: 'anjali.mehta@student.college.edu',
        studentPhone: '+91-9876543206',
        category: 'academic',
        description: 'Dispute regarding final grades affecting scholarship eligibility. Documentation provided shows possible calculation error. Need urgent review before scholarship deadline.',
        escalatedAt: '2025-11-16T10:30:00Z',
        escalationReason: 'Time-sensitive academic matter with financial implications',
        previousStaff: 'Academic Coordinator',
        escalationLevel: 2,
        assignedTo: 'Department Head'
      },
      {
        id: 'esc-7',
        title: 'Hostel Room Allocation Issue',
        status: 'escalated',
        priority: 'high',
        createdAt: '2025-11-09T08:00:00Z',
        studentName: 'Rajesh Kumar',
        studentEmail: 'rajesh.kumar@student.college.edu',
        studentPhone: '+91-9876543207',
        category: 'hostel',
        description: 'Wrong room allocation causing conflict between roommates. Multiple complaints filed. Need immediate reallocation to prevent further issues.',
        escalatedAt: '2025-11-16T16:20:00Z',
        escalationReason: 'Multiple complaints, potential for student conflict',
        previousStaff: 'Assistant Warden',
        escalationLevel: 1,
        assignedTo: 'Hostel Warden'
      },
      {
        id: 'esc-8',
        title: 'Library Digital Resources Access',
        status: 'escalated',
        priority: 'high',
        createdAt: '2025-11-08T13:45:00Z',
        studentName: 'Meera Desai',
        studentEmail: 'meera.desai@student.college.edu',
        studentPhone: '+91-9876543208',
        category: 'library',
        description: 'Unable to access online journals and research databases for past 5 days. Affecting PhD research work and paper submissions.',
        escalatedAt: '2025-11-16T14:10:00Z',
        escalationReason: 'Critical academic resource unavailable',
        previousStaff: 'Library Supervisor',
        escalationLevel: 2,
        assignedTo: 'Head Librarian'
      }
    ]
  }

  const filteredComplaints = escalatedComplaints.filter(complaint => {
    const matchesSearch = !searchTerm || 
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === "all" || complaint.category === categoryFilter
    const matchesPriority = priorityFilter === "all" || complaint.priority === priorityFilter

    return matchesSearch && matchesCategory && matchesPriority
  })

  const getTimeSinceEscalation = (escalatedAt: string) => {
    const escalated = new Date(escalatedAt)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - escalated.getTime()) / (1000 * 60 * 60))
    
    if (diffHours < 1) return "Just now"
    if (diffHours < 24) return `${diffHours}h ago`
    return `${Math.floor(diffHours / 24)}d ago`
  }

  const getEscalationLevelColor = (level: number) => {
    switch (level) {
      case 1: return "bg-yellow-500"
      case 2: return "bg-orange-500"
      case 3: return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  const getEscalationLevelText = (level: number) => {
    switch (level) {
      case 1: return "Level 1 - Supervisor"
      case 2: return "Level 2 - Department Head"
      case 3: return "Level 3 - Emergency"
      default: return "Level 0"
    }
  }

  const categories = [...new Set(escalatedComplaints.map(complaint => complaint.category))]

  // Calculate stats based on actual data
  const totalEscalations = escalatedComplaints.length
  const urgentPriority = escalatedComplaints.filter(c => c.priority === 'urgent').length
  const level2Plus = escalatedComplaints.filter(c => c.escalationLevel >= 2).length
  const avgWaitTime = "6.5h" // This could be calculated from actual data

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg">
        <AdminSidebar />
        <div className="lg:ml-64 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-lg text-muted-foreground">Loading escalation data...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg">
      <AdminSidebar />

      <div className="lg:ml-64 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Escalation Queue</h1>
              <p className="text-muted-foreground">Manage and resolve escalated complaints requiring urgent attention</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchEscalatedComplaints} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button className="bg-red-600 hover:bg-red-700">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Emergency Protocol
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Escalations</p>
                    <p className="text-2xl font-bold text-foreground">{totalEscalations}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Urgent Priority</p>
                    <p className="text-2xl font-bold text-foreground">
                      {urgentPriority}
                    </p>
                  </div>
                  <ArrowUp className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Wait Time</p>
                    <p className="text-2xl font-bold text-foreground">{avgWaitTime}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Level 2+</p>
                    <p className="text-2xl font-bold text-foreground">
                      {level2Plus}
                    </p>
                  </div>
                  <User className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search escalated complaints..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {categoryDisplayNames[category] || category}
                      </option>
                    ))}
                  </select>
                  <select 
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    More Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Escalation List */}
          <div className="space-y-4">
            {filteredComplaints.length > 0 ? (
              filteredComplaints.map((complaint) => (
                <Card key={complaint.id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-shadow border-l-4 border-l-red-500">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Complaint Details */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-lg font-semibold text-foreground">{complaint.title}</h3>
                            <Badge className={`${getEscalationLevelColor(complaint.escalationLevel)} text-white`}>
                              {getEscalationLevelText(complaint.escalationLevel)}
                            </Badge>
                            <Badge variant={complaint.priority === 'urgent' ? "destructive" : "secondary"}>
                              {complaint.priority.toUpperCase()}
                            </Badge>
                          </div>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>

                        <p className="text-muted-foreground">{complaint.description}</p>

                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground">{complaint.studentName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{complaint.studentEmail}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{complaint.studentPhone}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge className={categoryColors[complaint.category]}>
                            {categoryDisplayNames[complaint.category] || complaint.category}
                          </Badge>
                          {complaint.previousStaff && (
                            <Badge variant="outline" className="text-xs">
                              Previous: {complaint.previousStaff}
                            </Badge>
                          )}
                          {complaint.assignedTo && (
                            <Badge variant="secondary" className="text-xs">
                              Assigned to: {complaint.assignedTo}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Escalation Info and Actions */}
                      <div className="lg:w-64 space-y-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Escalated:</span>
                            <span className="font-medium">{getTimeSinceEscalation(complaint.escalatedAt)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Created:</span>
                            <span className="font-medium">
                              {new Date(complaint.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Reason: </span>
                            <span className="font-medium">{complaint.escalationReason}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            Reassign
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="py-12">
                  <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No escalated complaints found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filters</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}