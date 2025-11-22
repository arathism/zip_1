// Complaint management utilities

// Define Complaint Interface
export interface Complaint {
  _id: string;
  complaintId: string;
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in-progress" | "resolved" | "rejected" | "escalated";
  createdAt: string;
  assignedTo: string;
  assignedToId: string;
  dueDate: string;
  studentName: string;
  studentEmail: string;
  studentId: string;
  location?: string;
  escalationLevel: number;
  escalationPath: string[];
  studentRating?: number;
  lastUpdated: string;
  resolutionNotes?: string;
  attachments?: string[];
  updates: ComplaintUpdate[];
}

export interface ComplaintUpdate {
  id: string;
  timestamp: string;
  status: Complaint['status'];
  assignedTo: string;
  notes?: string;
  attachments?: string[];
  updatedBy: string;
}

// Staff assignment rules based on category
export const categoryStaffAssignment: Record<string, { level1: string, level2: string, level3: string }> = {
  "IT Services": {
    level1: "IT Support",
    level2: "IT Manager", 
    level3: "Dean of IT"
  },
  "Library": {
    level1: "Library Staff",
    level2: "Head Librarian",
    level3: "Library Director"
  },
  "Hostel": {
    level1: "Warden",
    level2: "Senior Warden",
    level3: "Hostel Administrator"
  },
  "Food Services": {
    level1: "Canteen Staff",
    level2: "Canteen Manager",
    level3: "Facilities Head"
  },
  "Academic": {
    level1: "Department Head",
    level2: "Dean",
    level3: "Vice Chancellor"
  },
  "Infrastructure": {
    level1: "Maintenance Staff",
    level2: "Facilities Manager",
    level3: "Infrastructure Head"
  }
};

// Priority-based due date rules (in hours)
export const priorityDueDates: Record<string, number> = {
  low: 168,    // 7 days
  medium: 72,  // 3 days
  high: 48,    // 2 days
  urgent: 24   // 1 day
};

// Utility functions
const generateComplaintId = (existingComplaints: Complaint[]): string => {
  const lastId = existingComplaints.length > 0 
    ? Math.max(...existingComplaints.map(c => parseInt(c.complaintId.split('-')[1])))
    : 0;
  return `CMP-${String(lastId + 1).padStart(3, '0')}`;
};

const assignStaffAndDueDate = (category: string, priority: string): { assignedTo: string, dueDate: string } => {
  const staffAssignment = categoryStaffAssignment[category] || categoryStaffAssignment["Infrastructure"];
  const dueDateHours = priorityDueDates[priority] || priorityDueDates.medium;
  
  const dueDate = new Date();
  dueDate.setHours(dueDate.getHours() + dueDateHours);
  
  return {
    assignedTo: staffAssignment.level1,
    dueDate: dueDate.toISOString()
  };
};

const getComplaintsFromStorage = (): Complaint[] => {
  if (typeof window === 'undefined') return [];
  const savedComplaints = localStorage.getItem('complaints_database');
  if (!savedComplaints) return [];
  
  // Parse and validate the complaints data
  const parsedComplaints = JSON.parse(savedComplaints);
  return parsedComplaints.map((complaint: any) => ({
    ...complaint,
    status: complaint.status as Complaint['status'],
    priority: complaint.priority as Complaint['priority']
  }));
};

const notifyComplaintsUpdate = (complaints: Complaint[]) => {
  localStorage.setItem('complaints_database', JSON.stringify(complaints));
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'complaints_database',
    newValue: JSON.stringify(complaints)
  }));
  window.dispatchEvent(new CustomEvent('complaintsUpdated', {
    detail: { complaints }
  }));
};

// Function to submit a new complaint from student
export const submitNewComplaint = (complaintData: {
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  location?: string;
  studentName: string;
  studentEmail: string;
  studentId: string;
}): Complaint => {
  
  const existingComplaints = getComplaintsFromStorage();
  const complaintId = generateComplaintId(existingComplaints);
  const { assignedTo, dueDate } = assignStaffAndDueDate(complaintData.category, complaintData.priority);
  const staffAssignment = categoryStaffAssignment[complaintData.category] || categoryStaffAssignment["Infrastructure"];
  const escalationPath = [staffAssignment.level1, staffAssignment.level2, staffAssignment.level3];

  const newComplaint: Complaint = {
    _id: `complaint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    complaintId,
    title: complaintData.title,
    description: complaintData.description,
    category: complaintData.category,
    priority: complaintData.priority,
    status: "pending",
    createdAt: new Date().toISOString(),
    assignedTo,
    assignedToId: assignedTo.toLowerCase().replace(/\s+/g, '-'),
    dueDate,
    studentName: complaintData.studentName,
    studentEmail: complaintData.studentEmail,
    studentId: complaintData.studentId,
    location: complaintData.location,
    escalationLevel: 0,
    escalationPath,
    lastUpdated: new Date().toISOString(),
    resolutionNotes: undefined,
    attachments: [],
    studentRating: undefined,
    updates: [{
      id: `update-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'pending',
      assignedTo: assignedTo,
      updatedBy: 'System'
    }]
  };
  
  const updatedComplaints = [newComplaint, ...existingComplaints];
  notifyComplaintsUpdate(updatedComplaints);
  return newComplaint;
};

// Function to get complaints by student ID
export const getStudentComplaints = (studentId: string): Complaint[] => {
  const allComplaints = getComplaintsFromStorage();
  return allComplaints.filter(complaint => complaint.studentId === studentId);
};

// Function to get complaint by ID for a specific student
export const getStudentComplaintById = (complaintId: string, studentId: string): Complaint | undefined => {
  const complaints = getComplaintsFromStorage();
  return complaints.find(complaint => 
    complaint._id === complaintId && complaint.studentId === studentId
  );
};

// Initialize with sample data if no complaints exist
export const initializeComplaints = () => {
  if (typeof window === 'undefined') return;
  
  const existingComplaints = getComplaintsFromStorage();
  if (existingComplaints.length === 0) {
    const sampleComplaints: Complaint[] = [
      {
        _id: '1',
        complaintId: 'CMP-001',
        title: 'Hostel WiFi Connection Issues',
        description: 'WiFi connection is very slow and frequently disconnects in Room 204',
        category: 'IT Services',
        priority: 'high',
        status: 'in-progress',
        createdAt: new Date().toISOString(),
        assignedTo: 'IT Support',
        assignedToId: 'it-support',
        dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        studentName: 'John Doe',
        studentEmail: 'john.doe@student.edu',
        studentId: 'student-001',
        location: 'Hostel Room 204',
        escalationLevel: 0,
        escalationPath: ['IT Support', 'IT Manager', 'Dean of IT'],
        lastUpdated: new Date().toISOString(),
        resolutionNotes: undefined,
        attachments: [],
        studentRating: undefined,
        updates: [
          {
            id: 'update-1',
            timestamp: new Date().toISOString(),
            status: 'pending',
            assignedTo: 'IT Support',
            updatedBy: 'System'
          },
          {
            id: 'update-2',
            timestamp: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            status: 'in-progress',
            assignedTo: 'IT Support',
            notes: 'Issue identified and being worked on',
            updatedBy: 'IT Support'
          }
        ]
      },
      {
        _id: '2',
        complaintId: 'CMP-002',
        title: 'Library Book Request',
        description: 'Need more copies of Data Structures and Algorithms textbook',
        category: 'Library',
        priority: 'medium',
        status: 'resolved',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        assignedTo: 'Library Staff',
        assignedToId: 'library-staff',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        studentName: 'Jane Smith',
        studentEmail: 'jane.smith@student.edu',
        studentId: 'student-002',
        location: 'Main Library',
        escalationLevel: 0,
        escalationPath: ['Library Staff', 'Head Librarian', 'Library Director'],
        lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        resolutionNotes: 'Additional copies ordered and will be available next week',
        attachments: [],
        studentRating: 5,
        updates: [
          {
            id: 'update-3',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
            assignedTo: 'Library Staff',
            updatedBy: 'System'
          },
          {
            id: 'update-4',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'in-progress',
            assignedTo: 'Library Staff',
            notes: 'Checking inventory and placing order',
            updatedBy: 'Library Staff'
          },
          {
            id: 'update-5',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'resolved',
            assignedTo: 'Library Staff',
            notes: 'Additional copies ordered and will be available next week',
            updatedBy: 'Library Staff'
          }
        ]
      }
    ];
    
    notifyComplaintsUpdate(sampleComplaints);
  }
};

// Initialize complaints when module is loaded
if (typeof window !== 'undefined') {
  initializeComplaints();
}