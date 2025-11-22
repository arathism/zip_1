"use client"

import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Clock, CheckCircle, AlertTriangle, TrendingUp, Users, Brain, ArrowUp, ArrowDown, RefreshCw, UserPlus, Search, Mail, Phone, Building, Calendar, Star } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

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
  escalationLevel?: number;
  daysOverdue?: number;
  isOverdue?: boolean;
  rating?: number;
  feedback?: string;
  resolution?: string;
  updatedAt?: string;
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
}

const statusColors: { [key: string]: string } = {
  pending: "bg-yellow-500",
  "in-progress": "bg-blue-500",
  resolved: "bg-green-500",
  escalated: "bg-red-500",
}

const priorityColors: { [key: string]: string } = {
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

// Department to category mapping
const departmentToCategory: { [key: string]: string } = {
  'library': 'library',
  'hostel': 'hostel',
  'academic': 'academic',
  'infrastructure': 'infrastructure',
  'cafeteria': 'cafeteria',
  'sports': 'sports',
  'other': 'general'
}

// Category display names
const categoryDisplayNames: { [key: string]: string } = {
  library: "Library",
  hostel: "Hostel",
  academic: "Academic",
  infrastructure: "Infrastructure",
  cafeteria: "Cafeteria",
  sports: "Sports",
  general: "General"
}

// Helper function to identify student complaints
const isStudentComplaint = (complaint: any): boolean => {
  return complaint.studentName && complaint.studentEmail && complaint.studentPhone;
};

// Helper functions from staff dashboard
const getEscalationColor = (level: number, isOverdue?: boolean) => {
  if (!isOverdue) return 'text-gray-600 bg-gray-50 border-gray-200';
  
  switch (level) {
    case 1: return 'text-orange-600 bg-orange-50 border-orange-200'
    case 2: return 'text-red-600 bg-red-50 border-red-200'
    case 3: return 'text-red-700 bg-red-100 border-red-300'
    default: return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

const getEscalationText = (level: number, daysOverdue?: number) => {
  if (level === 0 || daysOverdue === undefined) return '';
  
  switch (level) {
    case 1: return `⚡ Level 1 (${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue)`;
    case 2: return `🚨 Level 2 (${daysOverdue} days overdue)`;
    case 3: return `🔥 Level 3 (${daysOverdue} days overdue)`;
    default: return '';
  }
}

const getRemainingDays = (dueDate: string): number => {
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getEscalationInfo = (complaint: Complaint) => {
  if (!complaint.dueDate) return { remainingDays: 0, isOverdue: false, daysOverdue: 0, escalationLevel: 0 };
  
  const remainingDays = getRemainingDays(complaint.dueDate);
  const isOverdue = remainingDays < 0;
  const daysOverdue = isOverdue ? Math.abs(remainingDays) : 0;
  
  return {
    remainingDays,
    isOverdue,
    daysOverdue,
    escalationLevel: complaint.escalationLevel || 0
  };
};

// Helper function to get rating stars
const getRatingStars = (rating: number) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-1 text-sm font-medium text-foreground">({rating}/5)</span>
    </div>
  )
}

// Check and auto-escalate overdue complaints
const checkAndEscalateOverdueComplaints = async (complaints: Complaint[]): Promise<Complaint[]> => {
  const now = new Date();
  const updatedComplaints = [...complaints];
  let hasChanges = false;

  for (let i = 0; i < updatedComplaints.length; i++) {
    const comp = updatedComplaints[i];
    if (!comp.dueDate) continue;
    
    const dueDate = new Date(comp.dueDate);
    const isOverdue = dueDate < now && ['pending', 'assigned', 'in-progress'].includes(comp.status);
    
    if (isOverdue) {
      const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      let newEscalationLevel = comp.escalationLevel || 0;
      
      // Determine escalation level based on days overdue
      if (daysOverdue >= 7 && (comp.escalationLevel || 0) < 3) {
        newEscalationLevel = 3; // Critical
      } else if (daysOverdue >= 3 && (comp.escalationLevel || 0) < 2) {
        newEscalationLevel = 2; // High
      } else if (daysOverdue >= 1 && (comp.escalationLevel || 0) < 1) {
        newEscalationLevel = 1; // Medium
      }
      
      // If escalation level changed, update the complaint
      if (newEscalationLevel !== comp.escalationLevel) {
        updatedComplaints[i] = {
          ...comp,
          escalationLevel: newEscalationLevel,
          isOverdue: true,
          daysOverdue: daysOverdue,
          status: 'escalated' as const
        };
        
        hasChanges = true;
        console.log(`🚨 Auto-escalated complaint "${comp.title}" to Level ${newEscalationLevel} (${daysOverdue} days overdue)`);
      }
    }
  }
  
  return hasChanges ? updatedComplaints : complaints;
};

// Fetch resolved and rated complaints from student dashboard - UPDATED WITH DUPLICATE REMOVAL
const fetchResolvedRatedComplaints = async (): Promise<Complaint[]> => {
  try {
    // Get all complaints from localStorage (student complaints)
    const allComplaints = JSON.parse(localStorage.getItem('studentComplaints') || '[]');
    
    console.log('📋 All student complaints found:', allComplaints.length);
    
    // Use Set to track unique complaint IDs
    const uniqueComplaintIds = new Set();
    const uniqueResolvedRatedComplaints = [];
    
    for (const comp of allComplaints) {
      const compId = comp.id || comp._id;
      
      // Skip if we've already processed this complaint ID
      if (uniqueComplaintIds.has(compId)) {
        console.log('🔄 Skipping duplicate complaint:', compId);
        continue;
      }
      
      // Check if complaint is resolved and has rating
      const isResolved = comp.status === 'resolved' || comp.status === 'closed';
      const hasRating = comp.rating && (
        (typeof comp.rating === 'number' && comp.rating > 0) ||
        (comp.rating.score && comp.rating.score > 0)
      );
      
      if (isResolved && hasRating) {
        uniqueComplaintIds.add(compId);
        uniqueResolvedRatedComplaints.push(comp);
        console.log('✅ Found unique resolved and rated complaint:', compId, comp.title);
      }
    }

    console.log('📊 After duplicate removal:', {
      original: allComplaints.length,
      uniqueRated: uniqueResolvedRatedComplaints.length,
      duplicatesRemoved: allComplaints.length - uniqueResolvedRatedComplaints.length
    });
    
    // Convert to Complaint type
    const formattedComplaints: Complaint[] = uniqueResolvedRatedComplaints.map((comp: any) => {
      const now = new Date();
      const dueDate = new Date(comp.dueDate);
      const isOverdue = dueDate < now && ['pending', 'assigned', 'in-progress'].includes(comp.status);
      const daysOverdue = isOverdue ? Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      
      // Handle both rating formats
      let ratingValue = 0;
      let feedbackValue = '';
      
      if (typeof comp.rating === 'number') {
        ratingValue = comp.rating;
        feedbackValue = comp.feedback || '';
      } else if (comp.rating && comp.rating.score) {
        ratingValue = comp.rating.score;
        feedbackValue = comp.rating.comment || comp.feedback || '';
      }
      
      return {
        id: comp.id || comp._id || `comp-${Date.now()}-${Math.random()}`,
        _id: comp._id,
        title: comp.title || 'Untitled Complaint',
        description: comp.description || 'No description provided',
        category: comp.category || 'General',
        priority: comp.priority || 'medium',
        status: 'resolved',
        dueDate: comp.dueDate,
        studentName: comp.studentName || 'Unknown Student',
        studentEmail: comp.studentEmail || 'unknown@example.com',
        studentPhone: comp.studentPhone || '',
        assignedStaffName: comp.assignedStaffName || comp.assignedTo || 'Unassigned',
        assignedStaffId: comp.assignedStaffId,
        createdAt: comp.createdAt || new Date().toISOString(),
        overdue: false,
        escalationLevel: comp.escalationLevel || 0,
        daysOverdue: daysOverdue,
        isOverdue: isOverdue,
        rating: ratingValue,
        feedback: feedbackValue,
        resolution: comp.resolution,
        updatedAt: comp.updatedAt || comp.createdAt || new Date().toISOString()
      };
    });
    
    // If no resolved and rated complaints found, create some sample data for demonstration
    if (formattedComplaints.length === 0) {
      console.log('⚠️ No resolved and rated student complaints found, using sample data for demonstration');
      const sampleComplaints: Complaint[] = [
        {
          id: 'comp-rated-1',
          title: 'Internet Connectivity Issue Resolved',
          description: 'WiFi connectivity problem in library has been successfully resolved',
          category: 'IT',
          priority: 'high',
          status: 'resolved',
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          studentName: 'John Doe',
          studentEmail: 'john.doe@student.edu',
          studentPhone: '+91-9876543210',
          assignedStaffName: 'IT Support Team',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          overdue: false,
          escalationLevel: 0,
          rating: 5,
          feedback: 'Excellent service! The issue was resolved quickly and professionally.',
          resolution: 'Reconfigured access points and updated network settings. Issue resolved within 24 hours.',
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'comp-rated-2',
          title: 'Projector Maintenance Completed',
          description: 'Projector in room 301 has been repaired and calibrated',
          category: 'Facilities',
          priority: 'medium',
          status: 'resolved',
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          studentName: 'Jane Smith',
          studentEmail: 'jane.smith@student.edu',
          studentPhone: '+91-9876543211',
          assignedStaffName: 'Facilities Manager',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          overdue: false,
          escalationLevel: 0,
          rating: 4,
          feedback: 'Good service, but took a bit longer than expected.',
          resolution: 'Replaced projector bulb and recalibrated display settings. Fully functional now.',
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'comp-rated-3',
          title: 'Library Book Return System Fixed',
          description: 'Automated book return system has been repaired',
          category: 'Library',
          priority: 'medium',
          status: 'resolved',
          dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          studentName: 'Mike Johnson',
          studentEmail: 'mike.johnson@student.edu',
          studentPhone: '+91-9876543212',
          assignedStaffName: 'Library Staff',
          createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          overdue: false,
          escalationLevel: 0,
          rating: 5,
          feedback: 'Outstanding support! The system works perfectly now.',
          resolution: 'Fixed sensor alignment and updated software. All return stations now operational.',
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      return sampleComplaints;
    }
    
    console.log('✅ Final unique resolved and rated complaints:', formattedComplaints.length);
    return formattedComplaints;
  } catch (error) {
    console.error('❌ Error fetching resolved and rated complaints:', error);
    // Return empty array as fallback
    return [];
  }
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    totalStudents: 245,
    totalStaff: 18
  });

  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [allComplaints, setAllComplaints] = useState<Complaint[]>([]);
  const [resolvedRatedComplaints, setResolvedRatedComplaints] = useState<Complaint[]>([]);
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assigningComplaint, setAssigningComplaint] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
    setupRealTimeListeners();
    
    // Check for rating updates every 5 seconds as fallback
    const ratingPollInterval = setInterval(() => {
      checkForNewRatings();
    }, 5000);

    return () => {
      clearInterval(ratingPollInterval);
    };
  }, []);

  // Auto-check for overdue complaints every minute
  useEffect(() => {
    if (allComplaints.length === 0) return;

    const interval = setInterval(async () => {
      const updatedComplaints = await checkAndEscalateOverdueComplaints(allComplaints);
      if (updatedComplaints !== allComplaints) {
        setAllComplaints(updatedComplaints);
        // Update stats after auto-escalation
        const totalComplaints = updatedComplaints.length;
        const pendingComplaints = updatedComplaints.filter((c: any) => 
          c.status === 'pending' || c.status === 'assigned'
        ).length;
        const resolvedComplaints = updatedComplaints.filter((c: any) => 
          c.status === 'resolved' || c.status === 'closed'
        ).length;

        setStats(prev => ({
          ...prev,
          totalComplaints,
          pendingComplaints,
          resolvedComplaints
        }));
        console.log("🔄 Auto-escalation check completed");
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [allComplaints]);

  // Check for new ratings in student complaints
  const checkForNewRatings = async () => {
    try {
      console.log('🔄 Checking for new ratings in student complaints...');
      const resolvedRatedResponse = await fetchResolvedRatedComplaints();
      
      setResolvedRatedComplaints(prev => {
        // Always update if we found any rated complaints
        if (resolvedRatedResponse.length > 0) {
          console.log('✅ Found rated complaints:', resolvedRatedResponse.length);
          return resolvedRatedResponse;
        }
        
        return prev;
      });
    } catch (error) {
      console.error('Error checking for new ratings:', error);
    }
  };

  const setupRealTimeListeners = () => {
    // Enhanced rating update handler
    const handleRatingUpdate = (event: CustomEvent) => {
      const { complaintId, rating, feedback } = event.detail;
      console.log('⭐ Rating update received in admin:', complaintId, rating);
      
      // Update the resolvedRatedComplaints state
      setResolvedRatedComplaints(prev => {
        const complaintExists = prev.some(comp => comp.id === complaintId);
        
        if (complaintExists) {
          // Update existing complaint
          return prev.map(complaint => 
            complaint.id === complaintId 
              ? { 
                  ...complaint, 
                  rating: rating,
                  feedback: feedback,
                  updatedAt: new Date().toISOString()
                }
              : complaint
          );
        } else {
          // Add new rated complaint - fetch from student complaints
          const allStudentComplaints = JSON.parse(localStorage.getItem('studentComplaints') || '[]');
          const ratedComplaint = allStudentComplaints.find((comp: any) => 
            (comp.id === complaintId || comp._id === complaintId)
          );
          
          if (ratedComplaint && (ratedComplaint.status === 'resolved' || ratedComplaint.status === 'closed')) {
            // Handle both rating formats
            let ratingValue = 0;
            let feedbackValue = '';
            
            if (typeof ratedComplaint.rating === 'number') {
              ratingValue = ratedComplaint.rating;
              feedbackValue = ratedComplaint.feedback || '';
            } else if (ratedComplaint.rating && ratedComplaint.rating.score) {
              ratingValue = ratedComplaint.rating.score;
              feedbackValue = ratedComplaint.rating.comment || ratedComplaint.feedback || '';
            }
            
            const formattedComplaint: Complaint = {
              id: ratedComplaint.id || ratedComplaint._id,
              _id: ratedComplaint._id,
              title: ratedComplaint.title,
              description: ratedComplaint.description,
              category: ratedComplaint.category,
              priority: ratedComplaint.priority,
              status: 'resolved',
              dueDate: ratedComplaint.dueDate,
              studentName: ratedComplaint.studentName,
              studentEmail: ratedComplaint.studentEmail,
              studentPhone: ratedComplaint.studentPhone || '',
              assignedStaffName: ratedComplaint.assignedStaffName || ratedComplaint.assignedTo || 'Unassigned',
              assignedStaffId: ratedComplaint.assignedStaffId,
              createdAt: ratedComplaint.createdAt,
              overdue: false,
              escalationLevel: ratedComplaint.escalationLevel || 0,
              rating: ratingValue,
              feedback: feedbackValue,
              resolution: ratedComplaint.resolution,
              updatedAt: ratedComplaint.updatedAt || ratedComplaint.createdAt
            };
            return [formattedComplaint, ...prev];
          }
        }
        
        return prev;
      });

      console.log(`✅ Complaint ${complaintId} rating updated to ${rating} stars`);
    };

    // Storage listener for rating updates
    const handleRatingStorageChange = (event: StorageEvent) => {
      if (event.key === 'studentRatingSubmitted' && event.newValue) {
        try {
          const ratingData = JSON.parse(event.newValue);
          console.log('📦 Storage event - rating update:', ratingData);
          
          // Trigger the rating update handler
          handleRatingUpdate(new CustomEvent('storageRatingUpdate', { 
            detail: {
              complaintId: ratingData.complaintId,
              rating: ratingData.rating,
              feedback: ratingData.feedback
            }
          }));
        } catch (error) {
          console.error('Error parsing rating update:', error);
        }
      }
    };

    // Listen for student complaint updates that might include ratings
    const handleStudentComplaintUpdate = (event: CustomEvent) => {
      const updatedComplaint = event.detail;
      console.log('📝 Student complaint update received:', updatedComplaint);
      
      // Check if this is a resolved complaint with a rating
      if ((updatedComplaint.status === 'resolved' || updatedComplaint.status === 'closed') && 
          updatedComplaint.rating) {
        
        let ratingValue = 0;
        if (typeof updatedComplaint.rating === 'number') {
          ratingValue = updatedComplaint.rating;
        } else if (updatedComplaint.rating && updatedComplaint.rating.score) {
          ratingValue = updatedComplaint.rating.score;
        }
        
        if (ratingValue > 0) {
          handleRatingUpdate(new CustomEvent('studentComplaintRated', {
            detail: {
              complaintId: updatedComplaint.id || updatedComplaint._id,
              rating: ratingValue,
              feedback: updatedComplaint.feedback || (updatedComplaint.rating.comment || '')
            }
          }));
        }
      }
    };

    // Add all event listeners
    window.addEventListener('complaintRated', handleRatingUpdate as EventListener);
    window.addEventListener('studentComplaintUpdated', handleStudentComplaintUpdate as EventListener);
    window.addEventListener('storage', handleRatingStorageChange);

    return () => {
      window.removeEventListener('complaintRated', handleRatingUpdate as EventListener);
      window.removeEventListener('studentComplaintUpdated', handleStudentComplaintUpdate as EventListener);
      window.removeEventListener('storage', handleRatingStorageChange);
    };
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [complaintsResponse, staffResponse, resolvedRatedResponse] = await Promise.all([
        fetch('/api/complaints'),
        fetch('/api/staff'),
        fetchResolvedRatedComplaints() // Fetch resolved and rated complaints
      ]);

      if (complaintsResponse.ok) {
        const complaintsData = await complaintsResponse.json();
        
        if (complaintsData.success) {
          const complaints = complaintsData.data;
          console.log('📊 Fetched complaints from API:', complaints.length);
          
          // FILTER OUT STUDENT COMPLAINTS
          const nonStudentComplaints = complaints.filter((complaint: any) => !isStudentComplaint(complaint));
          console.log('📊 Non-student complaints:', nonStudentComplaints.length);
          
          const processedComplaints = nonStudentComplaints.map((complaint: any) => ({
            id: complaint._id || complaint.id,
            _id: complaint._id,
            title: complaint.title,
            status: complaint.status,
            priority: complaint.priority,
            createdAt: complaint.createdAt,
            studentName: complaint.studentName,
            studentEmail: complaint.studentEmail,
            studentPhone: complaint.studentPhone || '',
            category: complaint.category,
            description: complaint.description,
            studentCollegeId: complaint.studentCollegeId,
            assignedStaffName: complaint.assignedStaffName,
            assignedStaffId: complaint.assignedStaffId,
            dueDate: complaint.dueDate,
            overdue: isComplaintOverdue(complaint),
            escalationLevel: complaint.escalationLevel || 0,
            daysOverdue: complaint.daysOverdue || 0,
            isOverdue: complaint.isOverdue || false,
            updatedAt: complaint.updatedAt || complaint.createdAt
          }));

          // Check for escalations
          const complaintsWithEscalations = await checkAndEscalateOverdueComplaints(processedComplaints);
          
          setAllComplaints(complaintsWithEscalations);
          
          const recent = complaintsWithEscalations
            .sort((a: any, b: any) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            .slice(0, 5);

          setRecentComplaints(recent);

          const totalComplaints = complaintsWithEscalations.length;
          const pendingComplaints = complaintsWithEscalations.filter((c: any) => 
            c.status === 'pending' || c.status === 'assigned'
          ).length;
          const resolvedComplaints = complaintsWithEscalations.filter((c: any) => 
            c.status === 'resolved' || c.status === 'closed'
          ).length;

          setStats({
            totalComplaints,
            pendingComplaints,
            resolvedComplaints,
            totalStudents: 245,
            totalStaff: 18
          });
        }
      }

      if (staffResponse.ok) {
        const staffData = await staffResponse.json();
        if (staffData.success) {
          setAvailableStaff(staffData.data);
        }
      } else {
        setAvailableStaff(getMockStaffData());
      }

      // Set resolved and rated complaints
      console.log('📊 Setting resolved rated complaints:', resolvedRatedResponse.length);
      setResolvedRatedComplaints(resolvedRatedResponse);

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setAvailableStaff(getMockStaffData());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

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
    ];
  };

  // Add missing functions
  const isComplaintOverdue = (complaint: any): boolean => {
    if (!complaint.createdAt) return false;
    
    const created = new Date(complaint.createdAt);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    
    return complaint.status === 'pending' && daysDiff > 7;
  };

  const refreshData = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const calculateDueDate = (priority: string, category: string): string => {
    const now = new Date();
    let daysToAdd = 7; // Default for medium priority
    
    switch (priority) {
      case 'high':
        daysToAdd = 3; // 3 days for high priority
        break;
      case 'urgent':
        daysToAdd = 1; // 1 day for urgent
        break;
      case 'low':
        daysToAdd = 14; // 14 days for low priority
        break;
      default:
        daysToAdd = 7; // 7 days for medium
    }
    
    const dueDate = new Date(now);
    dueDate.setDate(now.getDate() + daysToAdd);
    return dueDate.toISOString();
  };

  const assignComplaintToStaff = async (complaintId: string, staffId: string) => {
    try {
      setAssigningComplaint(complaintId);
      
      const complaint = allComplaints.find(c => c.id === complaintId);
      if (!complaint) return;

      const staff = availableStaff.find(s => s.id === staffId);
      if (!staff) return;

      // Calculate due date based on priority
      const dueDate = calculateDueDate(complaint.priority, complaint.category);
      
      const response = await fetch(`/api/complaints/${complaintId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staffId: staffId,
          assignedBy: 'Admin',
          dueDate: dueDate
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assignedStaff = availableStaff.find(s => s.id === staffId);
        
        const updateComplaint = (complaint: Complaint) => 
          complaint.id === complaintId 
            ? { 
                ...complaint, 
                assignedStaffName: data.assignedStaffName || assignedStaff?.name,
                assignedStaffId: staffId,
                status: 'in-progress' as const,
                dueDate: dueDate
              } 
            : complaint;

        setRecentComplaints(prev => prev.map(updateComplaint));
        setAllComplaints(prev => prev.map(updateComplaint));

        setStats(prev => ({
          ...prev,
          pendingComplaints: Math.max(0, prev.pendingComplaints - 1)
        }));

        // Notify staff dashboard about new assignment
        window.dispatchEvent(new CustomEvent('complaintAssigned', {
          detail: {
            _id: complaintId,
            title: complaint.title,
            description: complaint.description,
            status: 'in-progress',
            priority: complaint.priority,
            category: complaint.category,
            createdAt: complaint.createdAt,
            dueDate: dueDate,
            studentName: complaint.studentName,
            studentEmail: complaint.studentEmail,
            studentPhone: complaint.studentPhone,
            studentCollegeId: complaint.studentCollegeId,
            assignedAt: new Date().toISOString(),
            assignedStaffName: data.assignedStaffName || assignedStaff?.name,
            assignedStaffId: staffId
          }
        }));

        console.log(`✅ Complaint assigned successfully to ${data.assignedStaffName || assignedStaff?.name}`);
      }
    } catch (error) {
      console.error('Error assigning complaint:', error);
    } finally {
      setAssigningComplaint(null);
    }
  };

  const updateComplaintStatus = async (complaintId: string, newStatus: string, complaint: Complaint) => {
    try {
      const response = await fetch(`/api/complaints/${complaintId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          updateMessage: `Status updated to ${newStatus}`,
          resolvedBy: 'Admin',
          studentEmail: complaint.studentEmail,
          studentPhone: complaint.studentPhone,
          studentName: complaint.studentName,
          complaintTitle: complaint.title
        }),
      });

      if (response.ok) {
        const updateComplaint = (comp: Complaint) => 
          comp.id === complaintId ? { ...comp, status: newStatus as any } : comp;

        setRecentComplaints(prev => prev.map(updateComplaint));
        setAllComplaints(prev => prev.map(updateComplaint));

        setStats(prev => {
          const newStats = { ...prev };
          if (newStatus === 'resolved') {
            newStats.resolvedComplaints += 1;
            newStats.pendingComplaints = Math.max(0, newStats.pendingComplaints - 1);
          }
          return newStats;
        });

        window.dispatchEvent(new CustomEvent('complaintStatusUpdated', {
          detail: { complaintId, newStatus }
        }));

        console.log(`✅ Complaint ${complaintId} status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating complaint status:', error);
    }
  };

  const getStaffForCategory = (category: string) => {
    const department = Object.keys(departmentToCategory).find(
      key => departmentToCategory[key] === category
    ) || category;

    return availableStaff.filter(staff => 
      staff.isActive && 
      (staff.department === department || staff.category === category)
    ).sort((a, b) => a.currentWorkload - b.currentWorkload); // Prefer less busy staff
  };

  const getCategories = () => {
    const categories = [...new Set(allComplaints.map(complaint => complaint.category))];
    return categories.sort();
  };

  const filteredComplaints = allComplaints.filter(complaint => {
    const matchesSearch = !searchTerm || 
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || complaint.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || complaint.priority === priorityFilter;
    const matchesCategory = categoryFilter === "all" || complaint.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const dashboardStats = [
    {
      title: "Total Complaints",
      value: stats.totalComplaints.toString(),
      description: "All time submissions",
      icon: FileText,
      color: "text-blue-500",
      change: "+12%",
      trend: "up",
    },
    {
      title: "Pending Assignment",
      value: stats.pendingComplaints.toString(),
      description: "Awaiting resolution",
      icon: Clock,
      color: "text-yellow-500",
      change: "-5%",
      trend: "down",
    },
    {
      title: "In Progress",
      value: allComplaints.filter(c => c.status === 'in-progress').length.toString(),
      description: "Being actively resolved",
      icon: AlertTriangle,
      color: "text-orange-500",
      change: "+8%",
      trend: "up",
    },
    {
      title: "Resolved",
      value: stats.resolvedComplaints.toString(),
      description: "Successfully completed",
      icon: CheckCircle,
      color: "text-green-500",
      change: "+15%",
      trend: "up",
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg">
        <AdminSidebar />
        <div className="lg:ml-64 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-lg text-muted-foreground">Loading dashboard...</p>
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
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Monitor and manage all complaints across the institution</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={refreshData} disabled={refreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Link href="/admin/complaints">
                <Button variant="outline">View All Complaints</Button>
              </Link>
              <Link href="/admin/analytics">
                <Button>View Analytics</Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardStats.map((stat) => (
              <Card key={stat.title} className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                    <div
                      className={`flex items-center gap-1 text-xs ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}
                    >
                      {stat.trend === "up" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {stat.change}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search and Filters */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search complaints by title, student, or category..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="escalated">Escalated</option>
                  </select>
                  <select 
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  >
                    <option value="all">All Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  >
                    <option value="all">All Categories</option>
                    {getCategories().map(category => (
                      <option key={category} value={category}>{categoryDisplayNames[category] || category}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resolved & Rated Complaints & Quick Actions */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* REPLACED: Recent Complaints with Resolved & Rated Complaints */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Resolved & Rated Complaints</CardTitle>
                    <CardDescription>
                      Student feedback on resolved complaints
                      {resolvedRatedComplaints.length > 0 && ` • ${resolvedRatedComplaints.length} unique complaints shown`}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    Total: {resolvedRatedComplaints.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resolvedRatedComplaints.slice(0, 5).map((complaint) => (
                    <div
                      key={complaint.id}
                      className="p-4 border border-border rounded-lg backdrop-blur-sm hover:shadow-md transition-shadow bg-card/30"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${priorityColors[complaint.priority]} text-white`}>
                            {complaint.priority.toUpperCase()}
                          </div>
                          <Badge className={`${categoryColors[complaint.category] || categoryColors.general} text-xs`}>
                            {categoryDisplayNames[complaint.category] || complaint.category}
                          </Badge>
                        </div>
                        {complaint.rating && getRatingStars(complaint.rating)}
                      </div>
                      
                      <div className="mb-3">
                        <h3 className="font-semibold text-foreground text-lg mb-1">{complaint.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{complaint.description}</p>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div>
                            <span className="font-medium">Student:</span> {complaint.studentName}
                          </div>
                          <div>
                            <span className="font-medium">Assigned To:</span> {complaint.assignedStaffName || 'Unassigned'}
                          </div>
                          <div>
                            <span className="font-medium">Resolved:</span> {new Date(complaint.updatedAt || complaint.createdAt).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Category:</span> {complaint.category}
                          </div>
                        </div>
                      </div>

                      {complaint.resolution && (
                        <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <h4 className="font-medium text-green-800 text-sm mb-1">Resolution Details:</h4>
                          <p className="text-sm text-green-700">{complaint.resolution}</p>
                        </div>
                      )}

                      {complaint.feedback && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="font-medium text-blue-800 text-sm mb-1">Student Feedback:</h4>
                          <p className="text-sm text-blue-700">{complaint.feedback}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  {resolvedRatedComplaints.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No resolved and rated complaints found</p>
                      <p className="text-sm mt-2">Complaints will appear here once they are resolved and rated by students</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Insights - KEEP EXACTLY THE SAME */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  AI Insights
                </CardTitle>
                <CardDescription>Smart recommendations and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="font-medium text-sm">Escalation Alert</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {allComplaints.filter(c => c.overdue || (c.escalationLevel && c.escalationLevel > 0)).length} complaints are escalated or overdue and require immediate attention
                    </p>
                  </div>

                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium text-sm">Trend Analysis</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {allComplaints.length} total complaints in the system
                    </p>
                  </div>

                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-sm">Resolution Rate</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Current resolution rate: {stats.totalComplaints > 0 ? Math.round((stats.resolvedComplaints / stats.totalComplaints) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* All Complaints Preview - KEEP EXACTLY THE SAME */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Complaints Overview</CardTitle>
                  <CardDescription>
                    Complete complaints list • {filteredComplaints.length} complaints found
                  </CardDescription>
                </div>
                <Link href="/admin/complaints">
                  <Button variant="outline" size="sm">
                    Manage All Complaints
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredComplaints.slice(0, 3).map((complaint) => (
                  <div
                    key={complaint.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{complaint.title}</h4>
                        <Badge className={`${statusColors[complaint.status]} text-white text-xs`}>
                          {complaint.status}
                        </Badge>
                        <Badge className={`${categoryColors[complaint.category] || categoryColors.general} text-xs`}>
                          {categoryDisplayNames[complaint.category] || complaint.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {complaint.studentName} • {new Date(complaint.createdAt).toLocaleDateString()}
                        {complaint.assignedStaffName && ` • ${complaint.assignedStaffName}`}
                      </p>
                      {complaint.dueDate && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          Due: {new Date(complaint.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <Link href={`/admin/complaints/${complaint.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
                {filteredComplaints.length === 0 && (
                  <div className="text-center py-6">
                    <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No complaints match your filters</p>
                  </div>
                )}
                {filteredComplaints.length > 3 && (
                  <div className="text-center pt-2">
                    <p className="text-sm text-muted-foreground">
                      ... and {filteredComplaints.length - 3} more complaints
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}