"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, LogOut, FileText, CheckCircle, Clock, AlertTriangle, BarChart3, User, Settings, Bell, Users, ArrowLeft, Plus, Calendar, Star } from "lucide-react"
import { Staff, Complaint, PerformanceStats } from "@/types"
import { dummyStaff, dummyComplaints, dummyPerformance } from "@/lib/dummy-data"

// Extended Complaint type with overdue properties and enhanced rating
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
  rating?: {
    score: number;
    comment: string;
    ratedAt: string;
  };
  feedback?: string;
  isOverdue?: boolean;
  daysOverdue?: number;
}

// Email response type
interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  mode?: string;
}

// Helper functions
const getRemainingDays = (dueDate: string): number => {
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getEscalationInfo = (complaint: ExtendedComplaint) => {
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

// Mock database functions
const fetchComplaintsForStaff = async (staffId: string, staffName: string, staffCategory: string): Promise<ExtendedComplaint[]> => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get all complaints from localStorage
    const allComplaints = JSON.parse(localStorage.getItem('studentComplaints') || '[]');
    
    console.log('📋 All complaints found:', allComplaints.length);
    
    // Use Set to track unique complaint IDs
    const uniqueComplaintIds = new Set();
    const staffComplaints = [];
    
    for (const comp of allComplaints) {
      const compId = comp.id || comp._id;
      
      // Skip if we've already processed this complaint ID
      if (uniqueComplaintIds.has(compId)) {
        continue;
      }
      
      // Check if complaint is assigned to this staff member
      const isAssigned = 
        comp.assignedStaffId === staffId || 
        comp.assignedStaffName === staffName ||
        comp.assignedTo === staffName;
      
      if (isAssigned) {
        uniqueComplaintIds.add(compId);
        staffComplaints.push(comp);
      }
    }
    
    console.log('✅ Unique complaints assigned to staff:', staffComplaints.length);
    
    // Convert to ExtendedComplaint type and check for overdue escalation
    const now = new Date();
    const formattedComplaints: ExtendedComplaint[] = staffComplaints.map((comp: any) => {
      const dueDate = new Date(comp.dueDate);
      const isOverdue = dueDate < now && ['pending', 'assigned', 'in-progress'].includes(comp.status);
      const daysOverdue = isOverdue ? Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      
      // Auto-escalate based on overdue status
      let escalationLevel = comp.escalationLevel || 0;
      if (isOverdue) {
        // Calculate escalation level based on how overdue it is
        if (daysOverdue >= 7) {
          escalationLevel = 3; // Critical - over 7 days overdue
        } else if (daysOverdue >= 3) {
          escalationLevel = 2; // High - 3-6 days overdue
        } else if (daysOverdue >= 1) {
          escalationLevel = 1; // Medium - 1-2 days overdue
        }
      }
      
      // Handle rating data
      let ratingValue = undefined;
      if (comp.rating) {
        if (typeof comp.rating === 'number') {
          ratingValue = {
            score: comp.rating,
            comment: comp.feedback || '',
            ratedAt: comp.updatedAt || comp.createdAt
          };
        } else if (comp.rating.score) {
          ratingValue = comp.rating;
        }
      }
      
      return {
        _id: comp.id || comp._id || `comp-${Date.now()}-${Math.random()}`,
        title: comp.title || 'Untitled Complaint',
        description: comp.description || 'No description provided',
        category: comp.category || 'General',
        priority: comp.priority || 'medium',
        status: comp.status || 'pending',
        dueDate: comp.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        submittedBy: comp.studentId || comp.submittedBy || 'unknown',
        studentName: comp.studentName || 'Unknown Student',
        studentEmail: comp.studentEmail || 'unknown@example.com',
        assignedTo: comp.assignedTo || comp.assignedStaffName || staffName,
        createdAt: comp.createdAt || new Date().toISOString(),
        updatedAt: comp.updatedAt || new Date().toISOString(),
        escalationLevel: escalationLevel,
        attachments: comp.attachments || [],
        remarks: comp.remarks,
        resolution: comp.resolution,
        rating: ratingValue,
        feedback: comp.feedback,
        isOverdue: isOverdue,
        daysOverdue: daysOverdue
      };
    });
    
    // If no complaints found, use dummy data for demonstration
    if (formattedComplaints.length === 0) {
      console.log('⚠️ No complaints found, using dummy data for demonstration');
      const assignedDummyComplaints = dummyComplaints.map(comp => ({
        _id: comp._id,
        title: comp.title,
        description: comp.description,
        category: comp.category,
        priority: comp.priority,
        status: comp.status,
        dueDate: comp.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        submittedBy: comp.submittedBy,
        studentName: comp.studentName || 'Student',
        studentEmail: comp.studentEmail || 'student@example.com',
        assignedTo: staffName,
        createdAt: comp.createdAt || new Date().toISOString(),
        updatedAt: comp.updatedAt || new Date().toISOString(),
        escalationLevel: comp.escalationLevel,
        attachments: comp.attachments || [],
        remarks: comp.remarks,
        resolution: comp.resolution,
        rating: comp.rating ? {
          score: typeof comp.rating === 'number' ? comp.rating : 0,
          comment: '',
          ratedAt: new Date().toISOString()
        } : undefined,
        isOverdue: false,
        daysOverdue: 0
      }));
      return assignedDummyComplaints;
    }
    
    return formattedComplaints;
  } catch (error) {
    console.error('❌ Error fetching complaints for staff:', error);
    // Fallback to dummy data with staff assignment
    return dummyComplaints.map(comp => ({
      _id: comp._id,
      title: comp.title,
      description: comp.description,
      category: comp.category,
      priority: comp.priority,
      status: comp.status,
      dueDate: comp.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      submittedBy: comp.submittedBy,
      studentName: comp.studentName || 'Student',
      studentEmail: comp.studentEmail || 'student@example.com',
      assignedTo: staffName,
      createdAt: comp.createdAt || new Date().toISOString(),
      updatedAt: comp.updatedAt || new Date().toISOString(),
      escalationLevel: comp.escalationLevel,
      attachments: comp.attachments || [],
      remarks: comp.remarks,
      resolution: comp.resolution,
      rating: comp.rating ? {
        score: typeof comp.rating === 'number' ? comp.rating : 0,
        comment: '',
        ratedAt: new Date().toISOString()
      } : undefined,
      isOverdue: false,
      daysOverdue: 0
    }));
  }
};

const updateComplaintStatus = async (complaintId: string, updates: any): Promise<boolean> => {
  try {
    // Update in localStorage - studentComplaints
    const allComplaints = JSON.parse(localStorage.getItem('studentComplaints') || '[]');
    const updatedComplaints = allComplaints.map((comp: any) =>
      (comp.id === complaintId || comp._id === complaintId) ? { ...comp, ...updates } : comp
    );
    localStorage.setItem('studentComplaints', JSON.stringify(updatedComplaints));
    
    // Also update in staffComplaints if exists
    const staffComplaints = JSON.parse(localStorage.getItem('staffComplaints') || '[]');
    if (staffComplaints.length > 0) {
      const updatedStaffComplaints = staffComplaints.map((comp: any) =>
        (comp.id === complaintId || comp._id === complaintId) ? { ...comp, ...updates } : comp
      );
      localStorage.setItem('staffComplaints', JSON.stringify(updatedStaffComplaints));
    }
    
    console.log('✅ Complaint status updated in all storage locations:', complaintId, updates);
    return true;
  } catch (error) {
    console.error('Error updating complaint status:', error);
    return false;
  }
};

// Enhanced email sending function that uses your email service
const sendStatusEmail = async (studentEmail: string, studentName: string, complaintTitle: string, complaintId: string, status: string, staffName: string, escalationLevel?: number): Promise<boolean> => {
  try {
    console.log('📧 Attempting to send status email to:', studentEmail);
    
    // Use your existing email service API
    const emailResponse = await fetch('/api/email/send-complaint-update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentEmail,
        studentName,
        complaintTitle,
        complaintId,
        updateMessage: getStatusUpdateMessage(status, staffName, escalationLevel),
        currentStatus: status,
        assignedStaff: staffName
      }),
    });

    if (emailResponse.ok) {
      const result: EmailResponse = await emailResponse.json();
      if (result.success) {
        console.log('✅ Status email sent successfully to:', studentEmail);
        
        // Store email in localStorage for testing/demonstration
        const emailLog = JSON.parse(localStorage.getItem('emailNotifications') || '[]');
        emailLog.push({
          to: studentEmail,
          subject: `Complaint Status Update - ${complaintTitle}`,
          message: getStatusUpdateMessage(status, staffName, escalationLevel),
          timestamp: new Date().toISOString(),
          status: 'sent'
        });
        localStorage.setItem('emailNotifications', JSON.stringify(emailLog));
        
        return true;
      } else {
        throw new Error(result.error || 'Email service returned error');
      }
    } else {
      throw new Error('Email API call failed');
    }
    
  } catch (error) {
    console.error('❌ Error sending status email:', error);
    
    // Fallback to localStorage logging if email service fails
    const emailLog = JSON.parse(localStorage.getItem('emailNotifications') || '[]');
    emailLog.push({
      to: studentEmail,
      subject: `Failed: Complaint Status Update - ${complaintTitle}`,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      status: 'failed'
    });
    localStorage.setItem('emailNotifications', JSON.stringify(emailLog));
    
    return false;
  }
};

// Helper function to generate status update messages
const getStatusUpdateMessage = (status: string, staffName: string, escalationLevel?: number): string => {
  switch (status) {
    case 'in-progress':
      return `Your complaint is now being actively worked on by ${staffName}. We are currently in the process of resolving your issue and will keep you updated on our progress.`;
    
    case 'resolved':
      return `Great news! Your complaint has been successfully resolved by ${staffName}. The issue has been addressed and closed. Thank you for using our service.`;
    
    case 'escalated':
      return `Your complaint has been automatically escalated to Level ${escalationLevel} due to being overdue. This ensures your concern receives higher priority attention. Staff: ${staffName}`;
    
    default:
      return `The status of your complaint has been updated to: ${status}. It is being handled by ${staffName}.`;
  }
};

// Enhanced student dashboard update function
const updateStudentDashboard = async (complaintId: string, status: string, staffName: string, resolution?: string, escalationLevel?: number) => {
  try {
    console.log('🔄 Updating student dashboard for complaint:', complaintId);
    
    // Update student complaints in localStorage
    const studentComplaints = JSON.parse(localStorage.getItem('studentComplaints') || '[]');
    const updatedStudentComplaints = studentComplaints.map((comp: any) =>
      (comp.id === complaintId || comp._id === complaintId) ? { 
        ...comp, 
        status: status,
        escalationLevel: escalationLevel !== undefined ? escalationLevel : comp.escalationLevel,
        resolution: resolution || comp.resolution,
        updatedAt: new Date().toISOString(),
        lastUpdatedBy: staffName
      } : comp
    );
    localStorage.setItem('studentComplaints', JSON.stringify(updatedStudentComplaints));
    
    console.log('✅ Student complaints updated in localStorage');
    
    // Update all complaints list for student view
    const allComplaints = JSON.parse(localStorage.getItem('allComplaints') || '[]');
    if (allComplaints.length > 0) {
      const updatedAllComplaints = allComplaints.map((comp: any) =>
        (comp.id === complaintId || comp._id === complaintId) ? { 
          ...comp, 
          status: status,
          escalationLevel: escalationLevel !== undefined ? escalationLevel : comp.escalationLevel,
          resolution: resolution || comp.resolution,
          updatedAt: new Date().toISOString(),
          lastUpdatedBy: staffName
        } : comp
      );
      localStorage.setItem('allComplaints', JSON.stringify(updatedAllComplaints));
    }
    
    // Broadcast update to student dashboard with more detailed information
    const updateEvent = new CustomEvent('complaintStatusUpdated', {
      detail: {
        complaintId: complaintId,
        status: status,
        staffName: staffName,
        resolution: resolution,
        escalationLevel: escalationLevel,
        updatedAt: new Date().toISOString(),
        forceRefresh: true,
        source: 'staff-dashboard'
      }
    });
    window.dispatchEvent(updateEvent);
    
    console.log('📢 Status update event broadcasted to student dashboard');
    
    // Also update localStorage for cross-tab communication with student-specific key
    const studentUpdate = {
      complaintId: complaintId,
      status: status,
      staffName: staffName,
      resolution: resolution,
      escalationLevel: escalationLevel,
      timestamp: new Date().toISOString(),
      source: 'staff'
    };
    localStorage.setItem('studentComplaintStatusUpdate', JSON.stringify(studentUpdate));
    
    console.log('💾 Status update saved to localStorage for student dashboard sync');
    
    // Force refresh student dashboard data
    const studentDataUpdate = new CustomEvent('forceStudentRefresh', {
      detail: {
        complaintId: complaintId,
        timestamp: new Date().toISOString()
      }
    });
    window.dispatchEvent(studentDataUpdate);
    
  } catch (error) {
    console.error('❌ Error updating student dashboard:', error);
  }
};

// Check and auto-escalate overdue complaints
const checkAndEscalateOverdueComplaints = async (complaints: ExtendedComplaint[], staffName: string): Promise<ExtendedComplaint[]> => {
  const now = new Date();
  const updatedComplaints = [...complaints];
  let hasChanges = false;

  for (let i = 0; i < updatedComplaints.length; i++) {
    const comp = updatedComplaints[i];
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
          updatedAt: new Date().toISOString(),
          remarks: `Auto-escalated to Level ${newEscalationLevel} due to being ${daysOverdue} day(s) overdue`
        };
        
        // Update in database
        await updateComplaintStatus(comp._id, {
          escalationLevel: newEscalationLevel,
          updatedAt: new Date().toISOString(),
          remarks: `Auto-escalated to Level ${newEscalationLevel} due to being ${daysOverdue} day(s) overdue`
        });
        
        // Send escalation email to student using your email service
        await sendStatusEmail(
          comp.studentEmail,
          comp.studentName,
          comp.title,
          comp._id,
          'escalated',
          staffName,
          newEscalationLevel
        );
        
        // Update student dashboard
        await updateStudentDashboard(comp._id, 'escalated', staffName, undefined, newEscalationLevel);
        
        hasChanges = true;
        console.log(`🚨 Auto-escalated complaint "${comp.title}" to Level ${newEscalationLevel} (${daysOverdue} days overdue)`);
      }
    }
  }
  
  return hasChanges ? updatedComplaints : complaints;
};

// Initialize sample data if none exists
const initializeSampleComplaints = (staffName: string, staffCategory: string) => {
  try {
    const existingComplaints = JSON.parse(localStorage.getItem('studentComplaints') || '[]');
    if (existingComplaints.length === 0) {
      const sampleComplaints = [
        {
          id: 'comp-1',
          title: 'Internet Connectivity Issues',
          description: 'Unable to connect to college WiFi in library',
          category: staffCategory || 'IT',
          priority: 'high',
          status: 'assigned',
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days overdue
          studentName: 'John Doe',
          studentEmail: 'john.doe@student.edu',
          assignedStaffName: staffName,
          assignedStaffId: 'staff-1',
          assignedTo: staffName,
          escalationLevel: 1, // Already escalated due to being overdue
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
          updatedAt: new Date().toISOString()
        },
        {
          id: 'comp-2',
          title: 'Projector Not Working',
          description: 'Projector in room 301 is not displaying properly',
          category: staffCategory || 'Facilities',
          priority: 'medium',
          status: 'assigned',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days remaining
          studentName: 'Jane Smith',
          studentEmail: 'jane.smith@student.edu',
          assignedStaffName: staffName,
          assignedStaffId: 'staff-1',
          assignedTo: staffName,
          escalationLevel: 0,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          updatedAt: new Date().toISOString()
        },
        {
          id: 'comp-3',
          title: 'Library Book Return Issue',
          description: 'Unable to return books through automated system',
          category: staffCategory || 'Library',
          priority: 'medium',
          status: 'in-progress',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days remaining
          studentName: 'Mike Johnson',
          studentEmail: 'mike.johnson@student.edu',
          assignedStaffName: staffName,
          assignedStaffId: 'staff-1',
          assignedTo: staffName,
          escalationLevel: 0,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          updatedAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('studentComplaints', JSON.stringify(sampleComplaints));
      
      // Also initialize allComplaints for student view
      localStorage.setItem('allComplaints', JSON.stringify(sampleComplaints));
      console.log('📝 Initialized sample complaints for:', staffName);
    }
  } catch (error) {
    console.error('Error initializing sample complaints:', error);
  }
};

// Sync complaints data across all storage locations
const syncComplaintsData = async (staffId: string, staffName: string, staffCategory: string): Promise<{ assigned: ExtendedComplaint[], all: ExtendedComplaint[] }> => {
  try {
    // Get the latest data from studentComplaints (source of truth)
    const studentComplaints = JSON.parse(localStorage.getItem('studentComplaints') || '[]');
    
    // Filter complaints assigned to this staff member
    const staffAssignedComplaints = studentComplaints.filter((comp: any) => 
      comp.assignedStaffId === staffId || 
      comp.assignedStaffName === staffName ||
      comp.assignedTo === staffName
    );
    
    // Get all complaints for this staff's category
    const allCategoryComplaints = studentComplaints.filter((comp: any) => 
      comp.category === staffCategory ||
      comp.assignedStaffId === staffId || 
      comp.assignedStaffName === staffName ||
      comp.assignedTo === staffName
    );
    
    // Update staffComplaints storage
    localStorage.setItem('staffComplaints', JSON.stringify(staffAssignedComplaints));
    
    // Update allComplaints storage for staff view
    localStorage.setItem('staffAllComplaints', JSON.stringify(allCategoryComplaints));
    
    console.log('🔄 Synced complaints data across storage locations');
    
    // Convert to ExtendedComplaint format for assigned complaints
    const now = new Date();
    const formattedAssignedComplaints: ExtendedComplaint[] = staffAssignedComplaints.map((comp: any) => {
      const dueDate = new Date(comp.dueDate);
      const isOverdue = dueDate < now && ['pending', 'assigned', 'in-progress'].includes(comp.status);
      const daysOverdue = isOverdue ? Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      
      // Handle rating data
      let ratingValue = undefined;
      if (comp.rating) {
        if (typeof comp.rating === 'number') {
          ratingValue = {
            score: comp.rating,
            comment: comp.feedback || '',
            ratedAt: comp.updatedAt || comp.createdAt
          };
        } else if (comp.rating.score) {
          ratingValue = comp.rating;
        }
      }
      
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
        assignedTo: comp.assignedTo || comp.assignedStaffName,
        createdAt: comp.createdAt,
        updatedAt: comp.updatedAt,
        escalationLevel: comp.escalationLevel || 0,
        attachments: comp.attachments || [],
        remarks: comp.remarks,
        resolution: comp.resolution,
        rating: ratingValue,
        feedback: comp.feedback,
        isOverdue: isOverdue,
        daysOverdue: daysOverdue
      };
    });
    
    // Convert to ExtendedComplaint format for all complaints
    const formattedAllComplaints: ExtendedComplaint[] = allCategoryComplaints.map((comp: any) => {
      const dueDate = new Date(comp.dueDate);
      const isOverdue = dueDate < now && ['pending', 'assigned', 'in-progress'].includes(comp.status);
      const daysOverdue = isOverdue ? Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      
      // Handle rating data
      let ratingValue = undefined;
      if (comp.rating) {
        if (typeof comp.rating === 'number') {
          ratingValue = {
            score: comp.rating,
            comment: comp.feedback || '',
            ratedAt: comp.updatedAt || comp.createdAt
          };
        } else if (comp.rating.score) {
          ratingValue = comp.rating;
        }
      }
      
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
        rating: ratingValue,
        feedback: comp.feedback,
        isOverdue: isOverdue,
        daysOverdue: daysOverdue
      };
    });
    
    return {
      assigned: formattedAssignedComplaints,
      all: formattedAllComplaints
    };
  } catch (error) {
    console.error('❌ Error syncing complaints data:', error);
    return { assigned: [], all: [] };
  }
};

export default function StaffDashboard() {
  const [staff, setStaff] = useState<Staff | null>(null)
  const [complaints, setComplaints] = useState<ExtendedComplaint[]>([])
  const [performance, setPerformance] = useState<PerformanceStats | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    overdue: 0,
    resolved: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Add state for rated complaints
  const [ratedComplaints, setRatedComplaints] = useState<ExtendedComplaint[]>([])

  // Helper function to get rating stars
  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-sm ${
              star <= rating ? "text-yellow-500" : "text-gray-300"
            }`}
          >
            ★
          </span>
        ))}
        <span className="text-xs text-muted-foreground ml-1">({rating}/5)</span>
      </div>
    )
  }

  // Function to fetch rated complaints - UPDATED WITH DUPLICATE REMOVAL
  const fetchRatedComplaints = async (staffName: string) => {
    try {
      // Get all complaints from localStorage
      const allComplaints = JSON.parse(localStorage.getItem('studentComplaints') || '[]');
      
      console.log('🔍 Searching for rated complaints in:', allComplaints.length, 'total complaints');
      
      // Use Set to track unique complaint IDs
      const uniqueComplaintIds = new Set();
      const uniqueRatedComplaints = [];
      
      for (const comp of allComplaints) {
        const compId = comp.id || comp._id;
        
        // Skip if we've already processed this complaint ID
        if (uniqueComplaintIds.has(compId)) {
          console.log('🔄 Skipping duplicate complaint:', compId);
          continue;
        }
        
        // Check if complaint is assigned to this staff member
        const isAssigned = 
          comp.assignedStaffName === staffName ||
          comp.assignedTo === staffName;
        
        // Check if complaint has a rating
        const hasRating = comp.rating && (
          (typeof comp.rating === 'number' && comp.rating > 0) ||
          (comp.rating.score && comp.rating.score > 0)
        );
        
        if (isAssigned && hasRating) {
          uniqueComplaintIds.add(compId);
          uniqueRatedComplaints.push(comp);
          console.log('✅ Found unique rated complaint:', compId, comp.title);
        }
      }

      console.log('📊 Duplicate removal results:', {
        original: allComplaints.length,
        uniqueRated: uniqueRatedComplaints.length,
        duplicatesRemoved: allComplaints.length - uniqueRatedComplaints.length
      });

      // Convert to ExtendedComplaint format
      const formattedRatedComplaints: ExtendedComplaint[] = uniqueRatedComplaints.map((comp: any) => {
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
          assignedTo: comp.assignedTo || comp.assignedStaffName,
          createdAt: comp.createdAt,
          updatedAt: comp.updatedAt,
          escalationLevel: comp.escalationLevel || 0,
          attachments: comp.attachments || [],
          remarks: comp.remarks,
          resolution: comp.resolution,
          rating: {
            score: ratingValue,
            comment: feedbackValue,
            ratedAt: comp.updatedAt || comp.createdAt
          },
          feedback: feedbackValue,
          isOverdue: false,
          daysOverdue: 0
        };
      });

      setRatedComplaints(formattedRatedComplaints);
      console.log('⭐ Final unique rated complaints:', formattedRatedComplaints.length);
    } catch (error) {
      console.error('Error fetching rated complaints:', error);
      setRatedComplaints([]);
    }
  };

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem("user")
    const token = localStorage.getItem("token")
    
    if (!userData || !token) {
      router.push("/auth/login")
      return
    }

    const userObj = JSON.parse(userData)
    if (userObj.role !== 'staff') {
      router.push("/auth/login")
      return
    }

    // Load dashboard data
    loadDashboardData(userObj.id, userObj.email, userObj.name, userObj.category)
  }, [router])

  // Auto-check for overdue complaints every minute
  useEffect(() => {
    if (!staff || complaints.length === 0) return;

    const interval = setInterval(async () => {
      const updatedComplaints = await checkAndEscalateOverdueComplaints(complaints, staff.name);
      if (updatedComplaints !== complaints) {
        setComplaints(updatedComplaints);
        updateStats(updatedComplaints);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [complaints, staff]);

  // Listen for new complaints from students
  useEffect(() => {
    const handleNewComplaint = async (event: any) => {
      if (event.detail?.source === 'student' && staff) {
        console.log('🆕 New complaint submitted by student, refreshing data...');
        await loadDashboardData(staff.id, staff.email, staff.name, staff.category || '');
      }
    };

    window.addEventListener('newComplaintSubmitted', handleNewComplaint);
    
    return () => {
      window.removeEventListener('newComplaintSubmitted', handleNewComplaint);
    };
  }, [staff]);

  // Listen for rating updates from students
  useEffect(() => {
    const handleRatingUpdate = (event: CustomEvent) => {
      const { complaintId, rating, feedback } = event.detail;
      console.log('⭐ Rating update received in staff dashboard:', complaintId, rating);
      
      if (staff) {
        // Refresh rated complaints when a new rating is submitted
        fetchRatedComplaints(staff.name);
      }
    };

    // Listen for storage events for rating updates
    const handleStorageRatingChange = (event: StorageEvent) => {
      if (event.key === 'studentRatingSubmitted' && event.newValue && staff) {
        console.log('📦 Storage event - rating update detected');
        fetchRatedComplaints(staff.name);
      }
    };

    window.addEventListener('complaintRated', handleRatingUpdate as EventListener);
    window.addEventListener('storage', handleStorageRatingChange);

    return () => {
      window.removeEventListener('complaintRated', handleRatingUpdate as EventListener);
      window.removeEventListener('storage', handleStorageRatingChange);
    };
  }, [staff]);

  const loadDashboardData = async (staffId: string, staffEmail: string, staffName: string, staffCategory: string) => {
    try {
      setIsLoading(true)
      
      console.log('🚀 Loading dashboard data for staff:', { staffId, staffName, staffCategory });
      
      // Initialize sample data if needed
      initializeSampleComplaints(staffName, staffCategory);
      
      // Set staff data
      const userData = JSON.parse(localStorage.getItem("user") || '{}')
      const staffData: Staff = {
        ...dummyStaff,
        id: staffId || userData.id,
        name: staffName || userData.name,
        email: staffEmail || userData.email,
        phone: userData.phone,
        department: userData.department,
        collegeId: userData.collegeId,
        category: staffCategory || userData.category
      }
      
      setStaff(staffData)

      // Sync data across all storage locations first
      await syncComplaintsData(staffId, staffName, staffCategory);
      
      // Fetch complaints for this staff member
      let staffComplaints = await fetchComplaintsForStaff(staffId, staffName, staffCategory);
      
      // Check and auto-escalate overdue complaints
      staffComplaints = await checkAndEscalateOverdueComplaints(staffComplaints, staffName);
      
      // Ensure no duplicates in the final list
      const uniqueComplaints = staffComplaints.filter((comp, index, self) => 
        index === self.findIndex(c => c._id === comp._id)
      );
      
      setComplaints(uniqueComplaints);
      updateStats(uniqueComplaints);

      // Fetch rated complaints
      await fetchRatedComplaints(staffName);

      // Set performance data
      setPerformance(dummyPerformance)
      
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error)
      // Fallback to dummy data
      const userData = JSON.parse(localStorage.getItem("user") || '{}')
      const staffData: Staff = {
        ...dummyStaff,
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        department: userData.department,
        collegeId: userData.collegeId,
        category: userData.category
      }
      
      setStaff(staffData)
      
      // Use dummy complaints assigned to this staff (ensure unique)
      const assignedDummyComplaints = dummyComplaints.map(comp => ({
        _id: comp._id,
        title: comp.title,
        description: comp.description,
        category: comp.category,
        priority: comp.priority,
        status: comp.status,
        dueDate: comp.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        submittedBy: comp.submittedBy,
        studentName: comp.studentName || 'Student',
        studentEmail: comp.studentEmail || 'student@example.com',
        assignedTo: userData.name,
        createdAt: comp.createdAt || new Date().toISOString(),
        updatedAt: comp.updatedAt || new Date().toISOString(),
        escalationLevel: comp.escalationLevel,
        attachments: comp.attachments || [],
        remarks: comp.remarks,
        resolution: comp.resolution,
        rating: comp.rating ? {
          score: typeof comp.rating === 'number' ? comp.rating : 0,
          comment: '',
          ratedAt: new Date().toISOString()
        } : undefined,
        isOverdue: false,
        daysOverdue: 0
      }));
      setComplaints(assignedDummyComplaints)
      updateStats(assignedDummyComplaints);
      setPerformance(dummyPerformance)
      
      // Set empty rated complaints for fallback
      setRatedComplaints([]);
    } finally {
      setIsLoading(false)
    }
  }

  const updateStats = (complaintsList: ExtendedComplaint[]) => {
    const now = new Date()
    const total = complaintsList.length
    const pending = complaintsList.filter(c => c.status === 'pending' || c.status === 'assigned').length
    const inProgress = complaintsList.filter(c => c.status === 'in-progress').length
    const resolved = complaintsList.filter(c => c.status === 'resolved' || c.status === 'closed').length
    const overdue = complaintsList.filter(c => {
      const escalationInfo = getEscalationInfo(c);
      return escalationInfo.isOverdue;
    }).length
    
    setStats({ total, pending, inProgress, overdue, resolved })
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    router.push("/")
  }

  const handleUpdateStatus = async (complaintId: string, newStatus: string) => {
    try {
      console.log('🔄 Updating complaint status:', complaintId, newStatus);
      
      // Find the complaint before updating
      const complaint = complaints.find(c => c._id === complaintId);
      if (!complaint || !staff) {
        console.error('❌ Complaint or staff not found');
        return;
      }
      
      console.log('📝 Complaint found:', complaint.title);
      console.log('👤 Staff:', staff.name);
      
      // Prepare resolution text if resolving
      const resolution = newStatus === 'resolved' 
        ? `Resolved by ${staff.name} on ${new Date().toLocaleDateString()}. Issue has been successfully addressed.`
        : undefined;

      // Update local state immediately
      const updatedComplaints = complaints.map(comp => 
        comp._id === complaintId 
          ? { 
              ...comp, 
              status: newStatus, 
              updatedAt: new Date().toISOString(),
              ...(resolution && { resolution })
            }
          : comp
      );
      
      setComplaints(updatedComplaints);
      updateStats(updatedComplaints);
      
      console.log('✅ Local state updated');
      
      // Update in database
      const updateData: any = {
        status: newStatus,
        updatedAt: new Date().toISOString()
      };
      
      if (resolution) {
        updateData.resolution = resolution;
      }
      
      const updateSuccess = await updateComplaintStatus(complaintId, updateData);
      
      if (updateSuccess) {
        console.log('✅ Database updated successfully');
        
        // Send status email to student using your email service
        console.log('📧 Sending email to student:', complaint.studentEmail);
        const emailSuccess = await sendStatusEmail(
          complaint.studentEmail,
          complaint.studentName,
          complaint.title,
          complaint._id,
          newStatus,
          staff.name
        );
        
        if (emailSuccess) {
          console.log('✅ Email sent successfully');
        } else {
          console.log('❌ Email sending failed');
        }
        
        // Update student dashboard with comprehensive sync
        console.log('🔄 Updating student dashboard...');
        await updateStudentDashboard(complaintId, newStatus, staff.name, resolution);
        console.log('✅ Student dashboard update completed');
        
        // Sync data across all storage locations
        await syncComplaintsData(staff.id, staff.name, staff.category || '');
        
        // Show success message
        alert(`Status updated to ${newStatus}! Student has been notified via email and dashboard updated.`);
      } else {
        console.error('❌ Database update failed');
        alert('Error updating status. Please try again.');
      }
      
    } catch (error) {
      console.error('❌ Error updating status:', error);
      alert('Error updating status. Please try again.');
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 text-primary animate-pulse mx-auto" />
          <p className="mt-4 text-lg text-foreground">Loading Staff Dashboard...</p>
          <p className="text-sm text-muted-foreground mt-2">Fetching your assigned complaints</p>
        </div>
      </div>
    )
  }

  if (!staff) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-foreground">Access Denied. Please login as staff.</p>
              <Button onClick={() => router.push("/auth/login")} className="mt-4">
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="bg-card/50 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">SolveIT Staff Portal</h1>
                <p className="text-sm text-muted-foreground">
                  {staff.department} • {staff.category || 'General'} • Staff Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-card/50">
                <Bell className="w-4 h-4" />
                Notifications
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push("/staff/profile")} className="bg-card/50">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm" className="bg-card/50">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {staff.name}!</h1>
          <p className="text-lg text-muted-foreground">
            Department: {staff.department} | Category: {staff.category || 'All Areas'} | Performance: {staff.performanceScore}%
          </p>
          <p className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block mt-2">
            📋 You have {complaints.length} assigned complaints
          </p>
          {stats.overdue > 0 && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full inline-block mt-2 ml-2">
              ⚠️ {stats.overdue} overdue complaint{stats.overdue > 1 ? 's' : ''} requiring attention
            </p>
          )}
          {ratedComplaints.length > 0 && (
            <p className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full inline-block mt-2 ml-2">
              ⭐ {ratedComplaints.length} rated complaint{ratedComplaints.length > 1 ? 's' : ''} from students
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground">Total Assigned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <p className="text-xs text-muted-foreground">All complaints</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Awaiting action</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">Being resolved</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground">Resolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground">Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <p className="text-xs text-muted-foreground">Past due date</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Complaints */}
          <div className="lg:col-span-2">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">Your Assigned Complaints</CardTitle>
                  <CardDescription>
                    {complaints.length > 0 
                      ? `Managing ${complaints.length} complaints assigned to you`
                      : 'No complaints assigned to you yet'
                    }
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      // Refresh complaints data
                      if (staff) {
                        loadDashboardData(staff.id, staff.email, staff.name, staff.category || '');
                      }
                    }}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button onClick={() => router.push("/staff/complaints")}>
                    <FileText className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {complaints.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No complaints assigned to you yet</p>
                    <p className="text-sm mt-2">Complaints will appear here when assigned to you</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {complaints.slice(0, 5).map((complaint) => {
                      const escalationInfo = getEscalationInfo(complaint);
                      
                      return (
                        <div key={complaint._id} className={`flex items-center justify-between p-4 border rounded-lg backdrop-blur-sm hover:shadow-md transition-shadow ${
                          escalationInfo.isOverdue ? 'border-red-200 bg-red-50/30' : 'border-border/50 bg-card/30'
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
                                <p className="text-xs mt-1">
                                  {escalationInfo.isOverdue ? (
                                    <span className="text-red-600">
                                      ⚠️ {escalationInfo.daysOverdue} day{escalationInfo.daysOverdue > 1 ? 's' : ''} overdue
                                    </span>
                                  ) : (
                                    <span className="text-green-600">
                                      📅 {escalationInfo.remainingDays} day{escalationInfo.remainingDays > 1 ? 's' : ''} remaining
                                    </span>
                                  )}
                                  {escalationInfo.escalationLevel > 0 && (
                                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border ${getEscalationColor(escalationInfo.escalationLevel, escalationInfo.isOverdue)}`}>
                                      {getEscalationText(escalationInfo.escalationLevel, escalationInfo.daysOverdue)}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <select 
                              value={complaint.status}
                              onChange={(e) => handleUpdateStatus(complaint._id, e.target.value)}
                              className={`text-xs px-2 py-1 rounded border ${getStatusColor(complaint.status)}`}
                            >
                              <option value="assigned">Assigned</option>
                              <option value="in-progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                            </select>
                            <Button 
                              size="sm" 
                              onClick={() => router.push(`/staff/complaints/${complaint._id}`)}
                            >
                              View
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Rated Complaints Card - UPDATED WITH DUPLICATE REMOVAL */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Student Ratings
                </CardTitle>
                <CardDescription>
                  {ratedComplaints.length > 0 
                    ? `You have ${ratedComplaints.length} unique rated complaint${ratedComplaints.length > 1 ? 's' : ''}`
                    : 'No ratings yet from students'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ratedComplaints.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No ratings received yet</p>
                    <p className="text-xs mt-1">Student ratings will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ratedComplaints.slice(0, 3).map((complaint) => (
                      <div key={complaint._id} className="border border-yellow-200 bg-yellow-50/30 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm text-foreground">{complaint.title}</h4>
                          {complaint.rating && getRatingStars(complaint.rating.score)}
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          <div>Student: {complaint.studentName}</div>
                          <div>Category: {complaint.category}</div>
                          <div>Rated: {new Date(complaint.rating?.ratedAt || complaint.updatedAt).toLocaleDateString()}</div>
                        </div>
                        {complaint.rating?.comment && (
                          <div className="text-xs bg-white p-2 rounded border">
                            <strong>Feedback:</strong> {complaint.rating.comment}
                          </div>
                        )}
                      </div>
                    ))}
                    {ratedComplaints.length > 3 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-xs"
                        onClick={() => {
                          // Navigate to a detailed ratings page or show more
                          alert(`You have ${ratedComplaints.length} unique rated complaints in total!`);
                        }}
                      >
                        View All {ratedComplaints.length} Ratings
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profile Card */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <User className="w-5 h-5" />
                  Profile Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium text-foreground">{staff.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium text-foreground">{staff.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Department:</span>
                    <span className="font-medium text-foreground">{staff.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium text-foreground">{staff.category || 'All Areas'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">College ID:</span>
                    <span className="font-medium text-foreground">{staff.collegeId}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Card */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <BarChart3 className="w-5 h-5" />
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Resolution Rate</span>
                    <span className="font-bold text-green-600">{performance?.resolutionRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Total Assigned</span>
                    <span className="font-bold text-foreground">{performance?.totalAssigned}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Total Resolved</span>
                    <span className="font-bold text-blue-600">{performance?.totalResolved}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Avg. Time</span>
                    <span className="font-bold text-foreground">{performance?.avgResolutionTime} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Satisfaction</span>
                    <span className="font-bold text-yellow-600">{performance?.studentSatisfaction}/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/staff/complaints")}>
                    <FileText className="w-4 h-4 mr-2" />
                    All Complaints
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/staff/performance")}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Performance
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/staff/profile")}>
                    <User className="w-4 h-4 mr-2" />
                    My Profile
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/")}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}