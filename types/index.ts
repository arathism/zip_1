export interface Staff {
  id: string
  name: string
  email: string
  phone: string
  department: string
  role: string
  collegeId: string
  assignedComplaints: number
  resolvedComplaints: number
  performanceScore: number
  category?: string
  joinedDate: string
}

export interface Complaint {
  _id: string
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'assigned' | 'in-progress' | 'resolved' | 'closed'
  dueDate: string
  submittedBy: string
  studentName: string
  studentEmail: string
  assignedTo: string
  createdAt: string
  updatedAt: string
  escalationLevel: number
  attachments?: string[]
  remarks?: string
  resolution?: string
  rating?: number
  feedback?: string
}

export interface PerformanceStats {
  totalAssigned: number
  totalResolved: number
  resolutionRate: number
  avgResolutionTime: number
  pendingCount: number
  overdueCount: number
  studentSatisfaction: number
  categoryBreakdown: {
    category: string
    count: number
    resolved: number
  }[]
}