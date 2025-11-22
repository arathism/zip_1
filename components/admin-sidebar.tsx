"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Clock,
  TrendingUp,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "All Complaints", href: "/admin/complaints", icon: FileText },
  { name: "Authority Management", href: "/admin/authorities", icon: Users },
  { name: "Performance Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Escalation Queue", href: "/admin/escalations", icon: Clock },
  { name: "Authority Ratings", href: "/admin/ratings", icon: TrendingUp },
  { name: "System Settings", href: "/admin/settings", icon: Settings },
]

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
}

interface EscalatedComplaint {
  id: string;
  _id?: string;
  title: string;
  status: 'escalated';
  priority: 'high';
  createdAt: string;
  studentName: string;
  category: string;
  description: string;
  escalatedAt: string;
  escalationReason: string;
  previousStaff?: string;
}

export function AdminSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [staff, setStaff] = useState<Staff[]>([])
  const [escalatedComplaints, setEscalatedComplaints] = useState<EscalatedComplaint[]>([])
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    fetchProfile()
    fetchStaffData()
    fetchEscalatedComplaints()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        return
      }

      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStaffData = async () => {
    try {
      const response = await fetch('/api/staff')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setStaff(data.data)
        } else {
          setStaff(getMockStaffData())
        }
      } else {
        setStaff(getMockStaffData())
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error)
      setStaff(getMockStaffData())
    }
  }

  const fetchEscalatedComplaints = async () => {
    try {
      const response = await fetch('/api/complaints?status=escalated')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setEscalatedComplaints(data.data)
        } else {
          setEscalatedComplaints(getMockEscalatedComplaints())
        }
      } else {
        setEscalatedComplaints(getMockEscalatedComplaints())
      }
    } catch (error) {
      console.error('Failed to fetch escalated complaints:', error)
      setEscalatedComplaints(getMockEscalatedComplaints())
    }
  }

  const getMockStaffData = (): Staff[] => {
    return [
      {
        id: '1',
        name: 'Chetana Jalaraddi',
        email: 'chetana.jalaraddi@college.edu',
        department: 'library',
        category: 'library',
        isActive: true,
        currentWorkload: 3,
        performanceScore: 85,
        role: 'Library Assistant',
        phone: '+91-9876543210'
      },
      {
        id: '2',
        name: 'Library Supervisor',
        email: 'library.supervisor@college.edu',
        department: 'library',
        category: 'library',
        isActive: true,
        currentWorkload: 5,
        performanceScore: 92,
        role: 'Supervisor',
        phone: '+91-9876543211'
      },
      {
        id: '3',
        name: 'Head Librarian',
        email: 'head.librarian@college.edu',
        department: 'library',
        category: 'library',
        isActive: true,
        currentWorkload: 2,
        performanceScore: 95,
        role: 'Director',
        phone: '+91-9876543212'
      },
      {
        id: '4',
        name: 'Banashree',
        email: 'banashree@college.edu',
        department: 'hostel',
        category: 'hostel',
        isActive: true,
        currentWorkload: 6,
        performanceScore: 88,
        role: 'Hostel Warden',
        phone: '+91-9876543213'
      },
      {
        id: '5',
        name: 'Assistant Warden',
        email: 'assistant.warden@college.edu',
        department: 'hostel',
        category: 'hostel',
        isActive: true,
        currentWorkload: 4,
        performanceScore: 82,
        role: 'Supervisor',
        phone: '+91-9876543214'
      },
      {
        id: '6',
        name: 'Academic Coordinator',
        email: 'academic.coordinator@college.edu',
        department: 'academic',
        category: 'academic',
        isActive: true,
        currentWorkload: 7,
        performanceScore: 90,
        role: 'Coordinator',
        phone: '+91-9876543215'
      },
      {
        id: '7',
        name: 'Department Head',
        email: 'department.head@college.edu',
        department: 'academic',
        category: 'academic',
        isActive: true,
        currentWorkload: 3,
        performanceScore: 94,
        role: 'Director',
        phone: '+91-9876543216'
      },
      {
        id: '8',
        name: 'Maintenance Engineer',
        email: 'maintenance@college.edu',
        department: 'infrastructure',
        category: 'infrastructure',
        isActive: true,
        currentWorkload: 8,
        performanceScore: 87,
        role: 'Engineer',
        phone: '+91-9876543217'
      },
      {
        id: '9',
        name: 'Civil Engineer',
        email: 'civil.engineer@college.edu',
        department: 'infrastructure',
        category: 'infrastructure',
        isActive: true,
        currentWorkload: 5,
        performanceScore: 89,
        role: 'Supervisor',
        phone: '+91-9876543218'
      },
      {
        id: '10',
        name: 'Cafeteria Manager',
        email: 'cafeteria.manager@college.edu',
        department: 'cafeteria',
        category: 'cafeteria',
        isActive: true,
        currentWorkload: 4,
        performanceScore: 85,
        role: 'Manager',
        phone: '+91-9876543219'
      },
      {
        id: '11',
        name: 'Sports Coordinator',
        email: 'sports.coordinator@college.edu',
        department: 'sports',
        category: 'sports',
        isActive: true,
        currentWorkload: 2,
        performanceScore: 82,
        role: 'Coordinator',
        phone: '+91-9876543220'
      },
      {
        id: '12',
        name: 'General Administrator',
        email: 'general.admin@college.edu',
        department: 'other',
        category: 'general',
        isActive: true,
        currentWorkload: 1,
        performanceScore: 95,
        role: 'Administrator',
        phone: '+91-9876543221'
      }
    ]
  }

  const getMockEscalatedComplaints = (): EscalatedComplaint[] => {
    return [
      {
        id: 'esc-1',
        title: 'Library Book Not Available',
        status: 'escalated',
        priority: 'high',
        createdAt: '2025-11-15T10:00:00Z',
        studentName: 'Rahul Sharma',
        category: 'library',
        description: 'Required textbook not available in library',
        escalatedAt: '2025-11-16T14:30:00Z',
        escalationReason: 'Not resolved within timeframe',
        previousStaff: 'Library Assistant'
      },
      {
        id: 'esc-2',
        title: 'Hostel Room Maintenance',
        status: 'escalated',
        priority: 'high',
        createdAt: '2025-11-14T09:00:00Z',
        studentName: 'Priya Patel',
        category: 'hostel',
        description: 'Leaking faucet in room bathroom',
        escalatedAt: '2025-11-16T15:45:00Z',
        escalationReason: 'Multiple complaints from same issue',
        previousStaff: 'Assistant Warden'
      },
      {
        id: 'esc-3',
        title: 'WiFi Connectivity Issues',
        status: 'escalated',
        priority: 'high',
        createdAt: '2025-11-13T14:20:00Z',
        studentName: 'Amit Kumar',
        category: 'infrastructure',
        description: 'No internet connection in hostel block',
        escalatedAt: '2025-11-16T11:20:00Z',
        escalationReason: 'Affecting multiple students',
        previousStaff: 'Maintenance Engineer'
      }
    ]
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-background/80 backdrop-blur-sm"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-2 p-6 border-b border-border">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <span className="text-xl font-bold text-foreground">SolveIT</span>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                {loading ? (
                  <>
                    <div className="h-4 w-20 bg-muted rounded animate-pulse mb-1"></div>
                    <div className="h-3 w-16 bg-muted rounded animate-pulse"></div>
                  </>
                ) : user ? (
                  <>
                    <p className="text-sm font-medium text-foreground truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.collegeId} • {user.department}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-foreground">Admin</p>
                    <p className="text-xs text-muted-foreground">Welcome</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Quick Stats Section */}
          <div className="p-4 border-t border-border space-y-3">
            <div className="text-xs font-medium text-muted-foreground">Quick Stats</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <div className="text-muted-foreground">Total Staff</div>
                <div className="font-medium text-foreground">{staff.length}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Escalations</div>
                <div className="font-medium text-foreground">{escalatedComplaints.length}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Active Staff</div>
                <div className="font-medium text-foreground">
                  {staff.filter(s => s.isActive).length}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Avg Rating</div>
                <div className="font-medium text-foreground">
                  {staff.length > 0 
                    ? Math.round(staff.reduce((acc, s) => acc + s.performanceScore, 0) / staff.length) 
                    : 0}%
                </div>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}