"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Clock, Search, Eye, MessageSquare, Star, AlertTriangle, AlertOctagon, Zap } from "lucide-react"

// Define TypeScript interface
export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "resolved" | "escalated";
  createdAt: string;
  assignedTo: string;
  dueDate: string;
  rating: number | null;
  escalationLevel?: number; // 0 = no escalation, 1-3 = escalation levels
  isOverdue?: boolean;
  daysOverdue?: number;
}

// Initial mock data - NO LEVEL 10
const initialComplaints: Complaint[] = [
  {
    id: "CMP-001",
    title: "Hostel WiFi Connection Issues",
    description: "WiFi connection is very slow and frequently disconnects in Room 204",
    category: "Hostel",
    priority: "high",
    status: "in-progress",
    createdAt: "2025-01-15",
    assignedTo: "IT Department",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days remaining
    rating: null,
    escalationLevel: 1,
    isOverdue: false,
    daysOverdue: 0,
  },
  {
    id: "CMP-002",
    title: "Library Book Request",
    description: "Need more copies of 'Data Structures and Algorithms' book",
    category: "Library",
    priority: "medium",
    status: "resolved",
    createdAt: "2025-01-10",
    assignedTo: "Library Staff",
    dueDate: "2025-01-17",
    rating: 4,
    escalationLevel: 0,
    isOverdue: false,
    daysOverdue: 0,
  },
  {
    id: "CMP-003",
    title: "Canteen Food Quality",
    description: "Food quality has deteriorated in the past week",
    category: "Canteen",
    priority: "medium",
    status: "pending",
    createdAt: "2025-01-12",
    assignedTo: "Pending Assignment",
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days overdue
    rating: null,
    escalationLevel: 2,
    isOverdue: true,
    daysOverdue: 5,
  },
]

const statusColors = {
  pending: "bg-yellow-500",
  "in-progress": "bg-blue-500",
  resolved: "bg-green-500",
  escalated: "bg-red-500",
}

const priorityColors = {
  low: "bg-green-500",
  medium: "bg-yellow-500",
  high: "bg-red-500",
}

// Escalation level colors and icons - ONLY 3 LEVELS (1, 2, 3)
const escalationConfig = {
  0: { color: "bg-gray-500", icon: null, text: "" },
  1: { color: "bg-orange-500", icon: AlertTriangle, text: "Level 1" },
  2: { color: "bg-red-500", icon: AlertOctagon, text: "Level 2" },
  3: { color: "bg-purple-500", icon: Zap, text: "Level 3" },
}

// Function to calculate escalation level based on days overdue - ONLY 3 LEVELS
const calculateEscalationLevel = (dueDate: string, status: string): number => {
  const now = new Date();
  const due = new Date(dueDate);
  const timeDiff = due.getTime() - now.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  
  // If complaint is already resolved, no escalation
  if (status === 'resolved') return 0;
  
  // If overdue, calculate based on overdue days
  if (timeDiff < 0) {
    const daysOverdue = Math.abs(daysRemaining);
    if (daysOverdue >= 7) return 3; // Level 3 - Critical: 7+ days overdue
    if (daysOverdue >= 3) return 2; // Level 2 - High: 3-6 days overdue
    if (daysOverdue >= 1) return 1; // Level 1 - Medium: 1-2 days overdue
    return 0;
  }
  
  // If not overdue but close to deadline
  if (daysRemaining <= 1) return 1; // Level 1 if due within 1 day
  if (daysRemaining <= 3) return 1; // Level 1 if due within 3 days
  
  return 0; // No escalation if plenty of time remaining
};

// Function to check and update escalation status for all complaints
const updateComplaintEscalations = (complaints: Complaint[]): Complaint[] => {
  const now = new Date();
  
  return complaints.map(complaint => {
    const dueDate = new Date(complaint.dueDate);
    const isOverdue = dueDate < now && ['pending', 'in-progress', 'escalated'].includes(complaint.status);
    const daysOverdue = isOverdue ? Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    // Calculate escalation level based on due date and current status
    const escalationLevel = calculateEscalationLevel(complaint.dueDate, complaint.status);
    
    // Update status to escalated if escalation level > 0 and not resolved
    let newStatus = complaint.status;
    if (escalationLevel > 0 && complaint.status !== 'resolved') {
      newStatus = 'escalated';
    }
    // If escalation level is 0 and status is escalated, revert to in-progress
    else if (escalationLevel === 0 && complaint.status === 'escalated') {
      newStatus = 'in-progress';
    }
    
    return {
      ...complaint,
      isOverdue,
      daysOverdue,
      escalationLevel,
      status: newStatus
    };
  });
};

// Function to remove duplicate complaints by ID
const removeDuplicateComplaints = (complaints: Complaint[]): Complaint[] => {
  const uniqueComplaints: Complaint[] = [];
  const seenIds = new Set();
  
  for (const complaint of complaints) {
    if (!seenIds.has(complaint.id)) {
      seenIds.add(complaint.id);
      uniqueComplaints.push(complaint);
    }
  }
  
  return uniqueComplaints;
};

// Function to safely get rating value and ensure it's within 1-5 range
const getRatingValue = (rating: number | null): number | null => {
  if (rating === null) return null;
  if (typeof rating === 'number') {
    // Ensure rating is between 1-5
    return Math.max(1, Math.min(5, rating));
  }
  return null;
};

// Function to clean complaints data - remove level 10 and ensure valid escalation levels
const cleanComplaintsData = (complaints: Complaint[]): Complaint[] => {
  return complaints.map(complaint => {
    // Remove level 10 - cap at level 3
    let cleanEscalationLevel = complaint.escalationLevel || 0;
    if (cleanEscalationLevel > 3) {
      cleanEscalationLevel = 3;
    }
    
    // Ensure rating is valid
    const cleanRating = getRatingValue(complaint.rating);
    
    return {
      ...complaint,
      escalationLevel: cleanEscalationLevel,
      rating: cleanRating
    };
  });
};

// Utility functions for complaint management
export const addNewComplaintToStorage = (complaintData: Omit<Complaint, 'id'>): Complaint => {
  // Get current complaints from localStorage
  const savedComplaints = localStorage.getItem('studentComplaints');
  const currentComplaints = savedComplaints ? JSON.parse(savedComplaints) : initialComplaints;
  
  // Generate new ID
  const complaintId = `CMP-${String(currentComplaints.length + 1).padStart(3, '0')}`;
  
  // Calculate initial escalation status
  const updatedComplaintData = updateComplaintEscalations([{ ...complaintData, id: complaintId }])[0];
  
  const newComplaint: Complaint = updatedComplaintData;
  
  // Update localStorage
  const updatedComplaints = [newComplaint, ...currentComplaints];
  const cleanedComplaints = cleanComplaintsData(updatedComplaints);
  localStorage.setItem('studentComplaints', JSON.stringify(cleanedComplaints));
  
  // Also update allComplaints for admin dashboard
  const allSavedComplaints = localStorage.getItem('allComplaints');
  const allCurrentComplaints = allSavedComplaints ? JSON.parse(allSavedComplaints) : [];
  const updatedAllComplaints = [newComplaint, ...allCurrentComplaints];
  const cleanedAllComplaints = cleanComplaintsData(updatedAllComplaints);
  localStorage.setItem('allComplaints', JSON.stringify(cleanedAllComplaints));

  // Dispatch storage event to notify other components
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'studentComplaints',
    newValue: JSON.stringify(cleanedComplaints)
  }));

  // Also dispatch events for allComplaints
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'allComplaints',
    newValue: JSON.stringify(cleanedAllComplaints)
  }));

  // Also dispatch a custom event for same-tab communication
  window.dispatchEvent(new CustomEvent('complaintsUpdated', {
    detail: { type: 'COMPLAINTS_UPDATED' }
  }));
  
  return newComplaint;
};

export const getComplaintsFromStorage = (): Complaint[] => {
  if (typeof window === 'undefined') return initialComplaints;
  
  const savedComplaints = localStorage.getItem('studentComplaints');
  let complaints = savedComplaints ? JSON.parse(savedComplaints) : initialComplaints;
  
  // Clean complaints data first
  complaints = cleanComplaintsData(complaints);
  
  // Update escalations for all complaints
  complaints = updateComplaintEscalations(complaints);
  
  // Remove duplicates before returning
  return removeDuplicateComplaints(complaints);
};

// FIXED: Update complaint rating without API calls
export const updateComplaintRating = (complaintId: string, rating: number): void => {
  // Get current complaints
  const savedComplaints = localStorage.getItem('studentComplaints');
  const currentComplaints = savedComplaints ? JSON.parse(savedComplaints) : initialComplaints;
  
  // Update rating in student complaints
  const updatedComplaints = currentComplaints.map((complaint: Complaint) =>
    complaint.id === complaintId ? { ...complaint, rating } : complaint
  );
  
  const cleanedComplaints = cleanComplaintsData(updatedComplaints);
  localStorage.setItem('studentComplaints', JSON.stringify(cleanedComplaints));
  
  // Also update allComplaints for admin dashboard - ONLY RATING UPDATES
  const allSavedComplaints = localStorage.getItem('allComplaints');
  const allCurrentComplaints = allSavedComplaints ? JSON.parse(allSavedComplaints) : [];
  const updatedAllComplaints = allCurrentComplaints.map((comp: Complaint) =>
    comp.id === complaintId ? { ...comp, rating } : comp
  );
  const cleanedAllComplaints = cleanComplaintsData(updatedAllComplaints);
  localStorage.setItem('allComplaints', JSON.stringify(cleanedAllComplaints));

  // Dispatch events for real-time updates
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'studentComplaints',
    newValue: JSON.stringify(cleanedComplaints)
  }));
  
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'allComplaints',
    newValue: JSON.stringify(cleanedAllComplaints)
  }));
  
  window.dispatchEvent(new CustomEvent('complaintsUpdated', {
    detail: { type: 'COMPLAINTS_UPDATED' }
  }));

  // Also dispatch rating update event specifically
  window.dispatchEvent(new CustomEvent('complaintRatingUpdated', {
    detail: { complaintId, rating }
  }));

  console.log(`✅ Rating updated for ${complaintId}: ${rating}/5`);
};

// Function to update complaint status (for staff dashboard) - ONLY UPDATES STATUS, NOT RATING
export const updateComplaintStatus = (complaintId: string, status: Complaint['status'], staffName: string, escalationLevel?: number): void => {
  const complaints = getComplaintsFromStorage();
  const updatedComplaints = complaints.map(complaint => {
    if (complaint.id === complaintId) {
      const now = new Date();
      const dueDate = new Date(complaint.dueDate);
      const isOverdue = dueDate < now && ['pending', 'in-progress', 'escalated'].includes(status);
      const daysOverdue = isOverdue ? Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      
      // Calculate escalation level if not provided
      const calculatedEscalationLevel = escalationLevel !== undefined ? escalationLevel : calculateEscalationLevel(complaint.dueDate, status);
      
      return { 
        ...complaint, 
        status: status,
        assignedTo: staffName,
        escalationLevel: calculatedEscalationLevel,
        isOverdue,
        daysOverdue,
        // Preserve existing rating - staff cannot change rating
        rating: complaint.rating
      };
    }
    return complaint;
  });
  
  const cleanedComplaints = cleanComplaintsData(updatedComplaints);
  localStorage.setItem('studentComplaints', JSON.stringify(cleanedComplaints));
  
  // Also update allComplaints for admin dashboard - ONLY STATUS UPDATES
  const allComplaints = JSON.parse(localStorage.getItem('allComplaints') || '[]');
  const updatedAllComplaints = allComplaints.map((comp: Complaint) => {
    if (comp.id === complaintId) {
      const now = new Date();
      const dueDate = new Date(comp.dueDate);
      const isOverdue = dueDate < now && ['pending', 'in-progress', 'escalated'].includes(status);
      const daysOverdue = isOverdue ? Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      
      const calculatedEscalationLevel = escalationLevel !== undefined ? escalationLevel : calculateEscalationLevel(comp.dueDate, status);
      
      return { 
        ...comp, 
        status: status,
        assignedTo: staffName,
        escalationLevel: calculatedEscalationLevel,
        isOverdue,
        daysOverdue,
        // Preserve existing rating
        rating: comp.rating
      };
    }
    return comp;
  });
  const cleanedAllComplaints = cleanComplaintsData(updatedAllComplaints);
  localStorage.setItem('allComplaints', JSON.stringify(cleanedAllComplaints));
  
  // Dispatch storage events
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'studentComplaints',
    newValue: JSON.stringify(cleanedComplaints)
  }));
  
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'allComplaints',
    newValue: JSON.stringify(cleanedAllComplaints)
  }));
  
  // Dispatch custom event for same-tab communication
  window.dispatchEvent(new CustomEvent('complaintStatusUpdated', {
    detail: { 
      complaintId, 
      status, 
      staffName, 
      escalationLevel: escalationLevel !== undefined ? escalationLevel : calculateEscalationLevel(complaintId, status) 
    }
  }));

  console.log(`✅ Status updated for ${complaintId}: ${status} by ${staffName}`);
};

// Custom hook for complaint state management
function useComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    // Track if we've already loaded complaints to prevent duplicates
    let hasLoaded = false;

    // Initial load - ensure we get the latest data
    const loadComplaints = () => {
      if (hasLoaded) return; // Prevent duplicate loading
      
      const savedComplaints = localStorage.getItem('studentComplaints');
      if (savedComplaints) {
        const parsedComplaints = JSON.parse(savedComplaints);
        // Clean data first, then update escalations and remove duplicates
        const cleanedComplaints = cleanComplaintsData(parsedComplaints);
        const updatedComplaints = updateComplaintEscalations(cleanedComplaints);
        const uniqueComplaints = removeDuplicateComplaints(updatedComplaints);
        setComplaints(uniqueComplaints);
        
        // Save the updated complaints back to localStorage
        localStorage.setItem('studentComplaints', JSON.stringify(uniqueComplaints));
      } else {
        // If no saved complaints, initialize with default data
        const updatedComplaints = updateComplaintEscalations(initialComplaints);
        localStorage.setItem('studentComplaints', JSON.stringify(updatedComplaints));
        setComplaints(updatedComplaints);
      }
      hasLoaded = true;
    };

    loadComplaints();

    // Set up interval to check for escalations every 30 seconds
    const escalationInterval = setInterval(() => {
      console.log('🔄 Checking for complaint escalations...');
      setComplaints(prev => {
        const updatedComplaints = updateComplaintEscalations(prev);
        const cleanedComplaints = cleanComplaintsData(updatedComplaints);
        // Save updated complaints to localStorage
        localStorage.setItem('studentComplaints', JSON.stringify(cleanedComplaints));
        
        // Also update allComplaints
        const allComplaints = JSON.parse(localStorage.getItem('allComplaints') || '[]');
        const updatedAllComplaints = updateComplaintEscalations(allComplaints);
        const cleanedAllComplaints = cleanComplaintsData(updatedAllComplaints);
        localStorage.setItem('allComplaints', JSON.stringify(cleanedAllComplaints));
        
        // Check if any complaints changed escalation level
        const changedComplaints = updatedComplaints.filter((comp, index) => {
          const prevComp = prev[index];
          return prevComp && (
            comp.escalationLevel !== prevComp.escalationLevel ||
            comp.status !== prevComp.status ||
            comp.daysOverdue !== prevComp.daysOverdue
          );
        });
        
        if (changedComplaints.length > 0) {
          console.log('📈 Escalation changes detected:', changedComplaints.map(c => ({
            id: c.id,
            title: c.title,
            escalationLevel: c.escalationLevel,
            daysOverdue: c.daysOverdue,
            status: c.status
          })));
        }
        
        return removeDuplicateComplaints(cleanedComplaints);
      });
    }, 30000); // Check every 30 seconds

    // Listen for storage changes (from other tabs/windows)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'studentComplaints') {
        if (event.newValue) {
          const parsedComplaints = JSON.parse(event.newValue);
          // Clean data, update escalations and remove duplicates before setting state
          const cleanedComplaints = cleanComplaintsData(parsedComplaints);
          const updatedComplaints = updateComplaintEscalations(cleanedComplaints);
          const uniqueComplaints = removeDuplicateComplaints(updatedComplaints);
          setComplaints(uniqueComplaints);
        } else {
          // If storage is cleared, reset to initial data
          const updatedComplaints = updateComplaintEscalations(initialComplaints);
          localStorage.setItem('studentComplaints', JSON.stringify(updatedComplaints));
          setComplaints(updatedComplaints);
        }
      }
      
      // Listen for status updates from staff dashboard
      if (event.key === 'studentComplaintStatusUpdate' && event.newValue) {
        try {
          const statusUpdate = JSON.parse(event.newValue);
          const { complaintId, status, staffName, escalationLevel } = statusUpdate;
          
          console.log('Status update received in complaint list:', complaintId, status, escalationLevel);
          
          // Update local complaints state
          setComplaints(prev => {
            const updatedComplaints = prev.map(complaint => {
              if (complaint.id === complaintId) {
                const now = new Date();
                const dueDate = new Date(complaint.dueDate);
                const isOverdue = dueDate < now && ['pending', 'in-progress', 'escalated'].includes(status);
                const daysOverdue = isOverdue ? Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
                const calculatedEscalationLevel = calculateEscalationLevel(complaint.dueDate, status);
                
                return { 
                  ...complaint, 
                  status: status,
                  assignedTo: staffName || complaint.assignedTo,
                  escalationLevel: escalationLevel !== undefined ? escalationLevel : calculatedEscalationLevel,
                  isOverdue,
                  daysOverdue,
                };
              }
              return complaint;
            });
            
            // Remove duplicates after update
            return removeDuplicateComplaints(updatedComplaints);
          });
        } catch (error) {
          console.error('Error processing status update from storage:', error);
        }
      }
      
      // Listen for rating updates from student dashboard
      if (event.key === 'complaintRatingUpdate' && event.newValue) {
        try {
          const ratingUpdate = JSON.parse(event.newValue);
          const { complaintId, rating } = ratingUpdate;
          
          console.log('Rating update received in complaint list:', complaintId, rating);
          
          // Update local complaints state
          setComplaints(prev => {
            const updatedComplaints = prev.map(complaint => {
              if (complaint.id === complaintId) {
                return { 
                  ...complaint, 
                  rating: rating
                };
              }
              return complaint;
            });
            
            // Remove duplicates after update
            return removeDuplicateComplaints(updatedComplaints);
          });
        } catch (error) {
          console.error('Error processing rating update from storage:', error);
        }
      }
    };

    // Listen for custom events (from same tab)
    const handleCustomEvent = () => {
      loadComplaints();
    };
    
    // Listen for complaint status updates from custom events
    const handleComplaintStatusUpdate = (event: CustomEvent) => {
      const { complaintId, status, staffName, escalationLevel } = event.detail;
      console.log('Custom event status update:', complaintId, status, escalationLevel);
      
      setComplaints(prev => {
        const updatedComplaints = prev.map(complaint => {
          if (complaint.id === complaintId) {
            const now = new Date();
            const dueDate = new Date(complaint.dueDate);
            const isOverdue = dueDate < now && ['pending', 'in-progress', 'escalated'].includes(status);
            const daysOverdue = isOverdue ? Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
            const calculatedEscalationLevel = calculateEscalationLevel(complaint.dueDate, status);
            
            return { 
              ...complaint, 
              status: status,
              assignedTo: staffName || complaint.assignedTo,
              escalationLevel: escalationLevel !== undefined ? escalationLevel : calculatedEscalationLevel,
              isOverdue,
              daysOverdue,
            };
          }
          return complaint;
        });
        
        // Remove duplicates after update
        return removeDuplicateComplaints(updatedComplaints);
      });
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('complaintsUpdated', handleCustomEvent);
    // @ts-ignore
    window.addEventListener('complaintStatusUpdated', handleComplaintStatusUpdate);
    // @ts-ignore
    window.addEventListener('complaintRatingUpdated', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('complaintsUpdated', handleCustomEvent);
      // @ts-ignore
      window.removeEventListener('complaintStatusUpdated', handleComplaintStatusUpdate);
      // @ts-ignore
      window.removeEventListener('complaintRatingUpdated', handleCustomEvent);
      clearInterval(escalationInterval);
    };
  }, []);

  return complaints;
}

export function ComplaintList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null)
  const complaints = useComplaints()

  // Remove duplicates in the final filtered list as an extra safeguard
  const filteredComplaints = removeDuplicateComplaints(
    complaints.filter(
      (complaint) =>
        complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.category.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  )

  // FIXED: Handle rating without API calls
  const handleRateComplaint = (complaintId: string, rating: number) => {
    updateComplaintRating(complaintId, rating)
  }

  // Calculate days remaining
  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Helper function to get escalation badge - ONLY SHOWS LEVELS 1-3
  const getEscalationBadge = (complaint: Complaint) => {
    const level = complaint.escalationLevel || 0;
    const config = escalationConfig[level as keyof typeof escalationConfig];
    
    // Show escalation badge only for levels 1-3
    if (level > 0 && level <= 3) {
      const IconComponent = config.icon;
      
      return (
        <Badge className={`${config.color} text-white flex items-center gap-1`}>
          {IconComponent && <IconComponent className="w-3 h-3" />}
          {config.text}
          {complaint.daysOverdue && complaint.daysOverdue > 0 && (
            <span className="ml-1">({complaint.daysOverdue} day{complaint.daysOverdue > 1 ? 's' : ''} overdue)</span>
          )}
        </Badge>
      );
    }
    
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search complaints..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Total: {filteredComplaints.length} complaints
        </div>
      </div>

      {filteredComplaints.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <div className="flex flex-col items-center gap-2">
              <Search className="w-8 h-8 text-muted-foreground" />
              <h3 className="font-medium">No complaints found</h3>
              <p className="text-muted-foreground text-sm">
                {searchTerm ? "Try adjusting your search terms" : "You haven't submitted any complaints yet"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredComplaints.map((complaint) => {
            const escalationBadge = getEscalationBadge(complaint);
            const daysRemaining = getDaysRemaining(complaint.dueDate);
            const isOverdue = daysRemaining < 0;
            // Safely get rating value
            const ratingValue = getRatingValue(complaint.rating);
            
            return (
              <Card key={complaint.id} className={`bg-card/50 backdrop-blur-sm border-border/50 ${
                complaint.escalationLevel && complaint.escalationLevel > 0 ? 'border-red-200 bg-red-50/30' : ''
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-lg">{complaint.title}</CardTitle>
                        <Badge className={`${statusColors[complaint.status]} text-white`}>
                          {complaint.status}
                        </Badge>
                        <Badge className={`${priorityColors[complaint.priority]} text-white`}>
                          {complaint.priority}
                        </Badge>
                        {/* Show escalation badge if escalated - NO LEVEL 10 */}
                        {escalationBadge}
                        {/* Show rating badge only for resolved complaints with rating */}
                        {complaint.status === "resolved" && ratingValue && (
                          <Badge variant="outline" className="text-xs border-yellow-200 bg-yellow-50">
                            ⭐ Rated {ratingValue}/5
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        ID: {complaint.id} • Category: {complaint.category} • Created: {complaint.createdAt}
                        {complaint.isOverdue && complaint.daysOverdue && complaint.daysOverdue > 0 && (
                          <span className="text-red-600 ml-2">
                            ⚠️ {complaint.daysOverdue} day{complaint.daysOverdue > 1 ? 's' : ''} overdue
                          </span>
                        )}
                        {complaint.escalationLevel && complaint.escalationLevel > 0 && !complaint.isOverdue && (
                          <span className="text-orange-600 ml-2">
                            ⚡ Escalation Level {complaint.escalationLevel} (Due soon)
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedComplaint(selectedComplaint === complaint.id ? null : complaint.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>

                {selectedComplaint === complaint.id && (
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-muted-foreground">{complaint.description}</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Created:</span> {complaint.createdAt}
                        </div>
                        <div>
                          <span className="font-medium">Due Date:</span> {complaint.dueDate}
                        </div>
                        <div>
                          <span className="font-medium">Assigned To:</span> {complaint.assignedTo}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span className={isOverdue ? "text-red-600 font-medium" : "text-green-600"}>
                            {complaint.status === "resolved"
                              ? "Resolved"
                              : isOverdue
                                ? `${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) > 1 ? 's' : ''} overdue`
                                : `${daysRemaining} day${daysRemaining > 1 ? 's' : ''} remaining`}
                          </span>
                        </div>
                        {complaint.escalationLevel && complaint.escalationLevel > 0 && complaint.escalationLevel <= 3 && (
                          <>
                            <div>
                              <span className="font-medium">Escalation Level:</span> {complaint.escalationLevel}/3
                            </div>
                            <div>
                              <span className="font-medium">Days {isOverdue ? 'Overdue' : 'Remaining'}:</span> {isOverdue ? complaint.daysOverdue : daysRemaining}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Show escalation warning for escalated complaints - ONLY LEVELS 1-3 */}
                      {complaint.escalationLevel && complaint.escalationLevel > 0 && complaint.escalationLevel <= 3 && (
                        <div className="border-l-4 border-red-500 bg-red-50 p-3 rounded">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-medium text-red-800">
                              This complaint has been escalated to Level {complaint.escalationLevel}
                            </span>
                          </div>
                          <p className="text-sm text-red-700 mt-1">
                            {complaint.escalationLevel === 1 && "Level 1: Due within 3 days or 1-2 days overdue - Moderate priority"}
                            {complaint.escalationLevel === 2 && "Level 2: 3-6 days overdue - High priority"} 
                            {complaint.escalationLevel === 3 && "Level 3: 7+ days overdue - Critical priority"}
                          </p>
                        </div>
                      )}

                      {/* Show rating section ONLY for resolved complaints */}
                      {complaint.status === "resolved" && (
                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-2">Rate Resolution Quality</h4>
                          {ratingValue ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm">Your rating:</span>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${star <= ratingValue ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                                  />
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Button
                                  key={star}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRateComplaint(complaint.id, star)}
                                  className="p-1 hover:bg-yellow-50"
                                >
                                  <Star className="w-6 h-6 hover:fill-yellow-400 hover:text-yellow-400 transition-colors" />
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                          <MessageSquare className="w-4 h-4" />
                          Add Comment
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  )
}