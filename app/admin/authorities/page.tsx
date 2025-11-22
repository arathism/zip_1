"use client"

import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Users, Mail, Phone, Building, Calendar, UserPlus, Filter, MoreVertical, Edit, Trash2, Eye } from "lucide-react"
import { useState, useEffect } from "react"

interface Staff {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  collegeId: string;
  isActive: boolean;
  assignedComplaints: number;
  resolvedComplaints: number;
  escalatedComplaints: number;
  performanceScore: number;
  currentWorkload?: number;
  category?: string;
  joinedDate?: string;
}

const departmentColors: { [key: string]: string } = {
  library: "bg-blue-100 text-blue-800 border-blue-200",
  hostel: "bg-purple-100 text-purple-800 border-purple-200",
  academic: "bg-green-100 text-green-800 border-green-200",
  infrastructure: "bg-orange-100 text-orange-800 border-orange-200",
  cafeteria: "bg-red-100 text-red-800 border-red-200",
  sports: "bg-indigo-100 text-indigo-800 border-indigo-200",
  other: "bg-gray-100 text-gray-800 border-gray-200"
}

const departmentDisplayNames: { [key: string]: string } = {
  library: "Library",
  hostel: "Hostel",
  academic: "Academic",
  infrastructure: "Infrastructure",
  cafeteria: "Cafeteria",
  sports: "Sports",
  other: "General"
}

export default function AuthorityManagementPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchStaffData()
  }, [])

  const fetchStaffData = async () => {
    try {
      setLoading(true)
      // First try to fetch from API
      const response = await fetch('/api/staff')
      if (response.ok) {
        const data = await response.json()
        console.log('API Response:', data) // Debug log
        if (data.success && data.data && data.data.length > 0) {
          setStaff(data.data)
        } else {
          // Fallback to mock data if API returns empty
          console.log('Using mock data - API returned empty or no success')
          setStaff(getMockStaffData())
        }
      } else {
        // Fallback to mock data if API fails
        console.log('Using mock data - API request failed')
        setStaff(getMockStaffData())
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error)
      // Fallback to mock data on error
      setStaff(getMockStaffData())
    } finally {
      setLoading(false)
    }
  }

  const getMockStaffData = (): Staff[] => {
    console.log('Loading mock staff data...') // Debug log
    return [
      // Library Department - EXACTLY from seed-staff
      {
        id: '1',
        name: "Library Assistant",
        email: "library.assistant@college.edu",
        phone: "9876543210",
        department: "library",
        role: "Assistant",
        collegeId: "COL001",
        isActive: true,
        assignedComplaints: 5,
        resolvedComplaints: 45,
        escalatedComplaints: 2,
        performanceScore: 92,
        currentWorkload: 5,
        category: "library",
        joinedDate: '2023-01-15'
      },
      {
        id: '2',
        name: "Library Supervisor",
        email: "library.supervisor@college.edu",
        phone: "9876543211",
        department: "library",
        role: "Supervisor",
        collegeId: "COL001",
        isActive: true,
        assignedComplaints: 3,
        resolvedComplaints: 128,
        escalatedComplaints: 5,
        performanceScore: 95,
        currentWorkload: 3,
        category: "library",
        joinedDate: '2022-08-20'
      },
      {
        id: '3',
        name: "Head Librarian",
        email: "head.librarian@college.edu",
        phone: "9876543212",
        department: "library",
        role: "Director",
        collegeId: "COL001",
        isActive: true,
        assignedComplaints: 1,
        resolvedComplaints: 89,
        escalatedComplaints: 3,
        performanceScore: 98,
        currentWorkload: 1,
        category: "library",
        joinedDate: '2021-03-10'
      },

      // Hostel Department - EXACTLY from seed-staff
      {
        id: '4',
        name: "Hostel Warden",
        email: "hostel.warden@college.edu",
        phone: "9876543213",
        department: "hostel",
        role: "Warden",
        collegeId: "COL001",
        isActive: true,
        assignedComplaints: 8,
        resolvedComplaints: 156,
        escalatedComplaints: 8,
        performanceScore: 88,
        currentWorkload: 8,
        category: "hostel",
        joinedDate: '2023-02-28'
      },
      {
        id: '5',
        name: "Assistant Warden",
        email: "assistant.warden@college.edu",
        phone: "9876543214",
        department: "hostel",
        role: "Supervisor",
        collegeId: "COL001",
        isActive: true,
        assignedComplaints: 6,
        resolvedComplaints: 92,
        escalatedComplaints: 4,
        performanceScore: 85,
        currentWorkload: 6,
        category: "hostel",
        joinedDate: '2023-05-15'
      },

      // Academic Department - EXACTLY from seed-staff
      {
        id: '6',
        name: "Academic Coordinator",
        email: "academic.coordinator@college.edu",
        phone: "9876543215",
        department: "academic",
        role: "Coordinator",
        collegeId: "COL001",
        isActive: true,
        assignedComplaints: 7,
        resolvedComplaints: 134,
        escalatedComplaints: 6,
        performanceScore: 90,
        currentWorkload: 7,
        category: "academic",
        joinedDate: '2022-11-01'
      },
      {
        id: '7',
        name: "Department Head",
        email: "department.head@college.edu",
        phone: "9876543216",
        department: "academic",
        role: "Director",
        collegeId: "COL001",
        isActive: true,
        assignedComplaints: 2,
        resolvedComplaints: 67,
        escalatedComplaints: 2,
        performanceScore: 94,
        currentWorkload: 2,
        category: "academic",
        joinedDate: '2020-09-12'
      },

      // Infrastructure Department - EXACTLY from seed-staff
      {
        id: '8',
        name: "Maintenance Engineer",
        email: "maintenance@college.edu",
        phone: "9876543217",
        department: "infrastructure",
        role: "Engineer",
        collegeId: "COL001",
        isActive: true,
        assignedComplaints: 12,
        resolvedComplaints: 178,
        escalatedComplaints: 12,
        performanceScore: 87,
        currentWorkload: 12,
        category: "infrastructure",
        joinedDate: '2023-03-22'
      },
      {
        id: '9',
        name: "Civil Engineer",
        email: "civil.engineer@college.edu",
        phone: "9876543218",
        department: "infrastructure",
        role: "Supervisor",
        collegeId: "COL001",
        isActive: true,
        assignedComplaints: 5,
        resolvedComplaints: 112,
        escalatedComplaints: 7,
        performanceScore: 89,
        currentWorkload: 5,
        category: "infrastructure",
        joinedDate: '2022-12-05'
      },

      // Cafeteria Department - EXACTLY from seed-staff
      {
        id: '10',
        name: "Cafeteria Manager",
        email: "cafeteria.manager@college.edu",
        phone: "9876543219",
        department: "cafeteria",
        role: "Manager",
        collegeId: "COL001",
        isActive: true,
        assignedComplaints: 4,
        resolvedComplaints: 98,
        escalatedComplaints: 3,
        performanceScore: 85,
        currentWorkload: 4,
        category: "cafeteria",
        joinedDate: '2023-04-18'
      },

      // Sports Department - EXACTLY from seed-staff
      {
        id: '11',
        name: "Sports Coordinator",
        email: "sports.coordinator@college.edu",
        phone: "9876543220",
        department: "sports",
        role: "Coordinator",
        collegeId: "COL001",
        isActive: true,
        assignedComplaints: 2,
        resolvedComplaints: 45,
        escalatedComplaints: 1,
        performanceScore: 82,
        currentWorkload: 2,
        category: "sports",
        joinedDate: '2023-06-30'
      },

      // Other/General Department - EXACTLY from seed-staff
      {
        id: '12',
        name: "General Administrator",
        email: "general.admin@college.edu",
        phone: "9876543221",
        department: "other",
        role: "Administrator",
        collegeId: "COL001",
        isActive: true,
        assignedComplaints: 1,
        resolvedComplaints: 23,
        escalatedComplaints: 0,
        performanceScore: 95,
        currentWorkload: 1,
        category: "general",
        joinedDate: '2021-07-25'
      }
    ]
  }

  const filteredStaff = staff.filter(member => {
    const matchesSearch = !searchTerm || 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDepartment = departmentFilter === "all" || member.department === departmentFilter
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && member.isActive) ||
      (statusFilter === "inactive" && !member.isActive)

    return matchesSearch && matchesDepartment && matchesStatus
  })

  const getWorkloadColor = (assignedComplaints: number) => {
    if (assignedComplaints > 8) return "bg-red-500"
    if (assignedComplaints > 5) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  const getPerformanceBgColor = (score: number) => {
    if (score >= 90) return "bg-green-500"
    if (score >= 80) return "bg-yellow-500"
    return "bg-red-500"
  }

  const departments = [...new Set(staff.map(member => member.department))]

  // Calculate stats based on actual data
  const totalStaff = staff.length
  const activeStaff = staff.filter(s => s.isActive).length
  const totalAssignedComplaints = staff.reduce((acc, s) => acc + s.assignedComplaints, 0)
  const totalResolvedComplaints = staff.reduce((acc, s) => acc + s.resolvedComplaints, 0)
  const avgPerformance = staff.length > 0 ? Math.round(staff.reduce((acc, s) => acc + s.performanceScore, 0) / staff.length) : 0

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg">
        <AdminSidebar />
        <div className="lg:ml-64 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-lg text-muted-foreground">Loading staff data...</p>
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
              <h1 className="text-3xl font-bold text-foreground">Authority Management</h1>
              <p className="text-muted-foreground">Manage all staff members and their assignments</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              <UserPlus className="w-4 h-4 mr-2" />
              Add New Staff
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Staff</p>
                    <p className="text-2xl font-bold text-foreground">{totalStaff}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Staff</p>
                    <p className="text-2xl font-bold text-foreground">
                      {activeStaff}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Assigned</p>
                    <p className="text-2xl font-bold text-foreground">
                      {totalAssignedComplaints}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Performance</p>
                    <p className="text-2xl font-bold text-foreground">
                      {avgPerformance}%
                    </p>
                  </div>
                  <Building className="w-8 h-8 text-green-500" />
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
                      placeholder="Search staff by name, email, or role..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select 
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  >
                    <option value="all">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>
                        {departmentDisplayNames[dept] || dept}
                      </option>
                    ))}
                  </select>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    More Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staff Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStaff.length > 0 ? (
              filteredStaff.map((member) => (
                <Card key={member.id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{member.name}</CardTitle>
                          <CardDescription>{member.role}</CardDescription>
                          <p className="text-xs text-muted-foreground mt-1">ID: {member.collegeId}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Department and Status */}
                    <div className="flex items-center justify-between">
                      <Badge className={departmentColors[member.department]}>
                        {departmentDisplayNames[member.department] || member.department}
                      </Badge>
                      <Badge variant={member.isActive ? "default" : "secondary"}>
                        {member.isActive ? "🟢 Active" : "🔴 Inactive"}
                      </Badge>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground truncate">{member.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">+91-{member.phone}</span>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div className="text-center">
                        <div className="text-lg font-bold text-foreground">
                          {member.assignedComplaints}
                        </div>
                        <div className="text-xs text-muted-foreground">Assigned</div>
                        <div className={`w-full h-1 mt-1 rounded-full ${getWorkloadColor(member.assignedComplaints)}`}></div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-foreground">
                          {member.resolvedComplaints}
                        </div>
                        <div className="text-xs text-muted-foreground">Resolved</div>
                        <div className="w-full h-1 mt-1 bg-gray-200 rounded-full">
                          <div 
                            className="h-1 rounded-full bg-green-500"
                            style={{ width: `${Math.min(100, (member.resolvedComplaints / (member.resolvedComplaints + member.escalatedComplaints || 1)) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-bold ${getPerformanceColor(member.performanceScore)}`}>
                          {member.performanceScore}%
                        </div>
                        <div className="text-xs text-muted-foreground">Performance</div>
                        <div className="w-full h-1 mt-1 bg-gray-200 rounded-full">
                          <div 
                            className={`h-1 rounded-full ${getPerformanceBgColor(member.performanceScore)}`}
                            style={{ width: `${member.performanceScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Escalation Info */}
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">
                        Escalated: <span className="font-medium text-foreground">{member.escalatedComplaints}</span> complaints
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="py-12">
                    <div className="text-center">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No staff members found</h3>
                      <p className="text-muted-foreground">Try adjusting your search or filters</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}