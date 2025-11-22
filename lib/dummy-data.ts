import { Staff, Complaint, PerformanceStats } from '@/types'

export const dummyStaff: Staff = {
  id: "staff_001",
  name: "Dr. Rajesh Kumar",
  email: "rajesh.kumar@college.edu",
  phone: "9876543210",
  department: "Computer Science",
  role: "staff",
  collegeId: "CS001",
  assignedComplaints: 15,
  resolvedComplaints: 42,
  performanceScore: 88,
  category: "Infrastructure",
  joinedDate: "2023-01-15"
}

export const dummyComplaints: Complaint[] = [
  {
    _id: "comp_001",
    title: "Projector not working in Lab 302",
    description: "The projector in computer lab 302 is not displaying properly. Colors are distorted and image is blurry. This affects our practical sessions.",
    category: "Infrastructure",
    priority: "high",
    status: "in-progress",
    dueDate: "2024-01-25",
    submittedBy: "stud_001",
    studentName: "Amit Sharma",
    studentEmail: "amit.sharma@student.college.edu",
    assignedTo: "staff_001",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-18",
    escalationLevel: 0,
    attachments: ["projector_image.jpg"],
    remarks: "Technician assigned. Parts ordered. Expected resolution in 2 days."
  },
  {
    _id: "comp_002",
    title: "AC not cooling in Library",
    description: "Air conditioner in the central library reading area is not cooling properly. Temperature remains high even at lowest setting.",
    category: "Infrastructure",
    priority: "medium",
    status: "assigned",
    dueDate: "2024-01-30",
    submittedBy: "stud_002",
    studentName: "Priya Patel",
    studentEmail: "priya.patel@student.college.edu",
    assignedTo: "staff_001",
    createdAt: "2024-01-20",
    updatedAt: "2024-01-20",
    escalationLevel: 0
  },
  {
    _id: "comp_003",
    title: "WiFi connectivity issues in Block A",
    description: "Frequent WiFi disconnections in Block A classrooms. Internet speed is very slow during peak hours.",
    category: "WiFi & Internet",
    priority: "urgent",
    status: "in-progress",
    dueDate: "2024-01-22",
    submittedBy: "stud_003",
    studentName: "Rohan Mehta",
    studentEmail: "rohan.mehta@student.college.edu",
    assignedTo: "staff_001",
    createdAt: "2024-01-18",
    updatedAt: "2024-01-19",
    escalationLevel: 1,
    remarks: "Network team investigating. Router replacement scheduled."
  },
  {
    _id: "comp_004",
    title: "Broken chairs in Seminar Hall",
    description: "Multiple chairs in the main seminar hall are broken and need immediate replacement for upcoming events.",
    category: "Infrastructure",
    priority: "medium",
    status: "pending",
    dueDate: "2024-02-05",
    submittedBy: "stud_004",
    studentName: "Neha Gupta",
    studentEmail: "neha.gupta@student.college.edu",
    assignedTo: "staff_001",
    createdAt: "2024-01-22",
    updatedAt: "2024-01-22",
    escalationLevel: 0
  },
  {
    _id: "comp_005",
    title: "Water leakage in 2nd floor washroom",
    description: "Continuous water leakage from ceiling in men's washroom on 2nd floor. Creating puddles and safety hazard.",
    category: "Washroom",
    priority: "high",
    status: "resolved",
    dueDate: "2024-01-20",
    submittedBy: "stud_005",
    studentName: "Vikram Singh",
    studentEmail: "vikram.singh@student.college.edu",
    assignedTo: "staff_001",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-15",
    escalationLevel: 0,
    resolution: "Pipe leakage fixed. Area cleaned and sanitized.",
    rating: 4,
    feedback: "Quick response. Good work!"
  }
]

export const dummyPerformance: PerformanceStats = {
  totalAssigned: 57,
  totalResolved: 42,
  resolutionRate: 88,
  avgResolutionTime: 2.3,
  pendingCount: 8,
  overdueCount: 2,
  studentSatisfaction: 4.2,
  categoryBreakdown: [
    { category: "Infrastructure", count: 25, resolved: 20 },
    { category: "WiFi & Internet", count: 12, resolved: 10 },
    { category: "Laboratory", count: 8, resolved: 6 },
    { category: "Library", count: 7, resolved: 6 },
    { category: "Other", count: 5, resolved: 4 }
  ]
}