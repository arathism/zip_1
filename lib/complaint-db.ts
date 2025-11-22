// Database simulation using localStorage
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
  attachments?: string[]; // URLs or file paths for uploaded files
  updates: ComplaintUpdate[]; // Status update history
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

// Staff assignment rules
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

// Priority-based due dates
export const priorityDueDates: Record<string, number> = {
  low: 168,    // 7 days
  medium: 72,  // 3 days
  high: 48,    // 2 days
  urgent: 24   // 1 day
};

// Database operations
export class ComplaintDB {
  private static readonly STORAGE_KEY = 'complaints_database';
  private static readonly FILES_KEY = 'uploaded_files';

  // Initialize with sample data
  static initialize(): void {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
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
          assignedToId: 'it-support-1',
          dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          studentName: 'John Doe',
          studentEmail: 'john.doe@student.edu',
          studentId: 'student-001',
          location: 'Hostel Room 204',
          escalationLevel: 0,
          escalationPath: ['IT Support', 'IT Manager', 'Dean of IT'],
          lastUpdated: new Date().toISOString(),
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
        }
      ];
      this.saveComplaints(sampleComplaints);
    }
  }

  // Get all complaints
  static getComplaints(): Complaint[] {
    const data = localStorage.getItem(this.STORAGE_KEY); // FIXED: Changed SORAGE_KEY to STORAGE_KEY
    return data ? JSON.parse(data) : [];
  }

  // Save complaints
  static saveComplaints(complaints: Complaint[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(complaints));
    this.notifyUpdate();
  }

  // Get complaint by ID
  static getComplaintById(id: string): Complaint | undefined {
    const complaints = this.getComplaints();
    return complaints.find(c => c._id === id);
  }

  // Add new complaint
  static addComplaint(complaintData: Omit<Complaint, '_id' | 'complaintId' | 'updates'>): Complaint {
    const complaints = this.getComplaints();
    const complaintId = this.generateComplaintId(complaints);
    
    const newComplaint: Complaint = {
      ...complaintData,
      _id: `complaint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      complaintId,
      updates: [{
        id: `update-${Date.now()}`,
        timestamp: new Date().toISOString(),
        status: 'pending',
        assignedTo: complaintData.assignedTo,
        updatedBy: 'System'
      }]
    };

    complaints.unshift(newComplaint);
    this.saveComplaints(complaints);
    return newComplaint;
  }

  // Update complaint
  static updateComplaint(id: string, updates: Partial<Complaint>): Complaint | null {
    const complaints = this.getComplaints();
    const index = complaints.findIndex(c => c._id === id);
    
    if (index === -1) return null;

    complaints[index] = {
      ...complaints[index],
      ...updates,
      lastUpdated: new Date().toISOString()
    };

    this.saveComplaints(complaints);
    return complaints[index];
  }

  // Add status update
  static addStatusUpdate(complaintId: string, update: Omit<ComplaintUpdate, 'id' | 'timestamp'>): Complaint | null {
    const complaint = this.getComplaintById(complaintId);
    if (!complaint) return null;

    const newUpdate: ComplaintUpdate = {
      ...update,
      id: `update-${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    complaint.updates.unshift(newUpdate);
    complaint.status = update.status;
    complaint.assignedTo = update.assignedTo;
    complaint.lastUpdated = new Date().toISOString();

    return this.updateComplaint(complaintId, complaint);
  }

  // File upload simulation
  static uploadFile(file: File, complaintId: string): string {
    const files = JSON.parse(localStorage.getItem(this.FILES_KEY) || '{}');
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fileUrl = URL.createObjectURL(file); // In real app, upload to server
    
    files[fileId] = {
      id: fileId,
      name: file.name,
      type: file.type,
      size: file.size,
      url: fileUrl,
      complaintId,
      uploadedAt: new Date().toISOString()
    };

    localStorage.setItem(this.FILES_KEY, JSON.stringify(files));
    return fileId;
  }

  // Get files for complaint
  static getComplaintFiles(complaintId: string): any[] {
    const files = JSON.parse(localStorage.getItem(this.FILES_KEY) || '{}');
    return Object.values(files).filter((file: any) => file.complaintId === complaintId);
  }

  // Generate complaint ID
  private static generateComplaintId(complaints: Complaint[]): string {
    const lastId = complaints.length > 0 
      ? Math.max(...complaints.map(c => parseInt(c.complaintId.split('-')[1])))
      : 0;
    return `CMP-${String(lastId + 1).padStart(3, '0')}`;
  }

  // Notify about updates
  private static notifyUpdate(): void {
    window.dispatchEvent(new Event('complaintsUpdated'));
  }
}

// Initialize database
if (typeof window !== 'undefined') {
  ComplaintDB.initialize();
}