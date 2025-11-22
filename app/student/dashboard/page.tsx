"use client"

import StudentSidebar from "@/components/student-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Clock, CheckCircle, AlertTriangle, TrendingUp, Eye, RefreshCw, Star } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// Status and priority colors
const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  assigned: "bg-blue-500",
  "in-progress": "bg-blue-500",
  resolved: "bg-green-500",
  closed: "bg-green-500",
  rejected: "bg-red-500"
}

const priorityColors: Record<string, string> = {
  low: "bg-green-500",
  medium: "bg-yellow-500",
  high: "bg-red-500",
  urgent: "bg-purple-500"
}

const getStatusColor = (status: string): string => {
  return statusColors[status] || "bg-gray-500";
}

const getPriorityColor = (priority: string): string => {
  return priorityColors[priority] || "bg-gray-500";
}

interface Complaint {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  dueDate?: string;
  assignedStaffName?: string;
  studentName: string;
  studentCollegeId: string;
  studentEmail: string;
  studentPhone?: string;
  department?: string;
  rating?: {
    score: number;
    comment: string;
    ratedAt: string;
  };
}

interface RatingModalProps {
  complaint: Complaint | null;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}

// Rating Modal Component
function RatingModal({ complaint, onClose, onSubmit }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(rating, comment);
      onClose();
    } catch (error) {
      console.error("Error submitting rating:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!complaint) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Rate Your Experience</CardTitle>
          <CardDescription>
            How was your complaint "{complaint.title}" resolved?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= rating 
                      ? "text-yellow-400 fill-yellow-400" 
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            {rating === 0 && "Select a rating (1-5 stars)"}
            {rating === 1 && "Poor - Very dissatisfied"}
            {rating === 2 && "Fair - Somewhat dissatisfied"}
            {rating === 3 && "Good - Satisfied"}
            {rating === 4 && "Very Good - Highly satisfied"}
            {rating === 5 && "Excellent - Outstanding service"}
          </div>

          <div>
            <label htmlFor="comment" className="text-sm font-medium mb-2 block">
              Additional Comments (Optional)
            </label>
            <textarea
              id="comment"
              placeholder="Tell us more about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 border border-border rounded-lg bg-background resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || rating === 0}
              className="flex-1"
            >
              {isSubmitting ? "Submitting..." : "Submit Rating"}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function StudentDashboardPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
    rated: 0
  })
  const [ratingModal, setRatingModal] = useState<{
    complaint: Complaint | null;
  }>({ complaint: null })
  const router = useRouter()

  const fetchComplaints = async () => {
    try {
      setIsLoading(true)
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      
      if (!userData || !userData.collegeId) {
        console.log('No user data found, redirecting to login')
        router.push('/login')
        return
      }

      console.log('Fetching complaints for student:', userData.collegeId)
      
      // Try localStorage first for immediate updates
      try {
        const localStorageComplaints = JSON.parse(localStorage.getItem('studentComplaints') || '[]');
        const studentComplaints = localStorageComplaints.filter((comp: any) => 
          comp.studentId === userData.collegeId || comp.studentCollegeId === userData.collegeId
        );
        
        if (studentComplaints.length > 0) {
          console.log('Found complaints in localStorage:', studentComplaints.length);
          const formattedComplaints: Complaint[] = studentComplaints.map((comp: any) => ({
            _id: comp.id || comp._id,
            title: comp.title,
            description: comp.description,
            category: comp.category,
            priority: comp.priority,
            status: comp.status,
            createdAt: comp.createdAt,
            dueDate: comp.dueDate,
            assignedStaffName: comp.assignedTo || comp.assignedStaffName,
            studentName: comp.studentName,
            studentCollegeId: comp.studentId || comp.studentCollegeId,
            studentEmail: comp.studentEmail,
            rating: comp.rating
          }));
          
          // Remove duplicates by _id
          const uniqueComplaints = formattedComplaints.filter((complaint, index, self) =>
            index === self.findIndex((c) => c._id === complaint._id)
          );
          
          setComplaints(uniqueComplaints);
          updateStats(uniqueComplaints);
          return; // Use localStorage data if available
        }
      } catch (localStorageError) {
        console.log('No complaints found in localStorage, trying API...');
      }
      
      // Also fetch from API for consistency
      const complaintsResponse = await fetch(`/api/complaints?studentCollegeId=${userData.collegeId}`)
      
      if (complaintsResponse.ok) {
        const data = await complaintsResponse.json()
        console.log('Complaints API response:', data)
        
        if (data.success) {
          const apiComplaints = data.data || []
          console.log('Student complaints from API:', apiComplaints.length)
          
          // Remove duplicates from API data
          const uniqueApiComplaints = apiComplaints.filter((complaint: Complaint, index: number, self: Complaint[]) =>
            index === self.findIndex((c) => c._id === complaint._id)
          );
          
          setComplaints(uniqueApiComplaints);
          updateStats(uniqueApiComplaints);
        } else {
          console.error('API returned error:', data.error)
        }
      } else {
        console.error('Failed to fetch complaints from API, status:', complaintsResponse.status)
      }
    } catch (error) {
      console.error('Failed to fetch complaints:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateStats = (complaintsList: Complaint[]) => {
    const total = complaintsList.length
    const pending = complaintsList.filter((c: Complaint) => 
      c.status === 'pending' || c.status === 'assigned'
    ).length
    const inProgress = complaintsList.filter((c: Complaint) => 
      c.status === 'in-progress'
    ).length
    const resolved = complaintsList.filter((c: Complaint) => 
      c.status === 'resolved' || c.status === 'closed'
    ).length
    const rejected = complaintsList.filter((c: Complaint) => 
      c.status === 'rejected'
    ).length
    const rated = complaintsList.filter((c: Complaint) => 
      c.rating !== undefined
    ).length
    
    setStats({ total, pending, inProgress, resolved, rejected, rated })
    console.log('Updated stats:', { total, pending, inProgress, resolved, rejected, rated })
  }

  // Add new complaint to local state immediately
  const addNewComplaint = (newComplaint: Complaint) => {
    setComplaints(prev => {
      // Remove any existing complaint with same ID to avoid duplicates
      const filteredComplaints = prev.filter(c => c._id !== newComplaint._id);
      const updatedComplaints = [newComplaint, ...filteredComplaints];
      
      console.log('Added new complaint, total now:', updatedComplaints.length);
      return updatedComplaints;
    })
    
    // Update localStorage
    try {
      const currentComplaints = JSON.parse(localStorage.getItem('studentComplaints') || '[]');
      // Remove any existing complaint with same ID
      const filteredComplaints = currentComplaints.filter((c: any) => 
        c.id !== newComplaint._id && c._id !== newComplaint._id
      );
      const updatedComplaints = [newComplaint, ...filteredComplaints];
      localStorage.setItem('studentComplaints', JSON.stringify(updatedComplaints));
    } catch (error) {
      console.error('Error updating localStorage:', error);
    }
    
    // Refresh stats after a short delay
    setTimeout(() => {
      fetchComplaints();
    }, 100)
  }

  // Submit rating for a complaint - UPDATED WITH ADMIN DASHBOARD EVENTS
  const submitRating = async (complaintId: string, rating: number, comment: string) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      
      // First update local state immediately for better UX
      setComplaints(prev => 
        prev.map(complaint => 
          complaint._id === complaintId 
            ? { 
                ...complaint, 
                rating: {
                  score: rating,
                  comment: comment,
                  ratedAt: new Date().toISOString()
                }
              } 
            : complaint
        )
      );
      
      // Update localStorage immediately
      try {
        const currentComplaints = JSON.parse(localStorage.getItem('studentComplaints') || '[]');
        const updatedComplaints = currentComplaints.map((comp: any) => 
          (comp.id === complaintId || comp._id === complaintId)
            ? { 
                ...comp, 
                rating: { 
                  score: rating, 
                  comment: comment, 
                  ratedAt: new Date().toISOString() 
                } 
              }
            : comp
        );
        localStorage.setItem('studentComplaints', JSON.stringify(updatedComplaints));
        
        // Also update the main complaints storage to sync with staff dashboard
        const allComplaints = JSON.parse(localStorage.getItem('allComplaints') || '[]');
        if (allComplaints.length > 0) {
          const updatedAllComplaints = allComplaints.map((comp: any) => 
            (comp.id === complaintId || comp._id === complaintId)
              ? { 
                  ...comp, 
                  rating: { 
                    score: rating, 
                    comment: comment, 
                    ratedAt: new Date().toISOString() 
                  } 
                }
              : comp
          );
          localStorage.setItem('allComplaints', JSON.stringify(updatedAllComplaints));
        }
        
        // Update staff complaints storage if exists
        const staffComplaints = JSON.parse(localStorage.getItem('staffComplaints') || '[]');
        if (staffComplaints.length > 0) {
          const updatedStaffComplaints = staffComplaints.map((comp: any) => 
            (comp.id === complaintId || comp._id === complaintId)
              ? { 
                  ...comp, 
                  rating: { 
                    score: rating, 
                    comment: comment, 
                    ratedAt: new Date().toISOString() 
                  } 
                }
              : comp
          );
          localStorage.setItem('staffComplaints', JSON.stringify(updatedStaffComplaints));
        }
        
        // Update staff all complaints storage if exists
        const staffAllComplaints = JSON.parse(localStorage.getItem('staffAllComplaints') || '[]');
        if (staffAllComplaints.length > 0) {
          const updatedStaffAllComplaints = staffAllComplaints.map((comp: any) => 
            (comp.id === complaintId || comp._id === complaintId)
              ? { 
                  ...comp, 
                  rating: { 
                    score: rating, 
                    comment: comment, 
                    ratedAt: new Date().toISOString() 
                  } 
                }
              : comp
          );
          localStorage.setItem('staffAllComplaints', JSON.stringify(updatedStaffAllComplaints));
        }
        
        console.log('✅ Rating updated in all localStorage locations');
      } catch (error) {
        console.error('Error updating localStorage rating:', error);
      }
      
      // Try API submission but don't block on failure
      try {
        const response = await fetch(`/api/complaints/${complaintId}/rate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rating: rating,
            comment: comment,
            studentId: userData.id || userData.collegeId
          }),
        });

        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            console.log('✅ Rating submitted successfully via API');
          } else {
            console.warn('⚠️ API returned error but rating saved locally:', result.error);
          }
        } else {
          console.warn('⚠️ API call failed but rating saved locally');
        }
      } catch (apiError) {
        console.warn('⚠️ API call failed but rating saved locally:', apiError);
      }
      
      // BROADCAST RATING UPDATE TO ADMIN DASHBOARD - NEW CODE
      const ratingData = {
        complaintId: complaintId,
        rating: rating,
        feedback: comment,
        timestamp: new Date().toISOString(),
        source: 'student'
      };
      
      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('complaintRated', {
        detail: ratingData
      }));
      
      // Also update localStorage for cross-tab communication
      localStorage.setItem('studentRatingSubmitted', JSON.stringify(ratingData));
      
      // Dispatch another event for student complaint updates
      window.dispatchEvent(new CustomEvent('studentComplaintUpdated', {
        detail: {
          id: complaintId,
          rating: rating,
          feedback: comment,
          status: 'resolved',
          updatedAt: new Date().toISOString()
        }
      }));
      
      console.log('✅ Rating submitted and events dispatched for admin dashboard');
      
      // Refresh stats
      setTimeout(fetchComplaints, 500);
      
      // Show success message
      alert('✅ Thank you for your rating! Your feedback has been recorded and will help us improve our service.');
      
    } catch (error) {
      console.error('Error in rating submission process:', error);
      alert('⚠️ Rating saved locally but there was an issue syncing with the server. Your feedback is still recorded.');
    }
  }

  // Render star rating display - ONLY for resolved complaints
  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? "text-yellow-400 fill-yellow-400" 
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">({rating}/5)</span>
      </div>
    )
  }

  // Fetch complaints on component mount
  useEffect(() => {
    fetchComplaints()
    
    // Set up polling for real-time updates every 10 seconds
    const interval = setInterval(fetchComplaints, 10000)
    
    return () => clearInterval(interval)
  }, [])

  // Listen for new complaint submissions from the same tab
  useEffect(() => {
    const handleComplaintSubmitted = (event: CustomEvent) => {
      console.log('New complaint submitted event received:', event.detail)
      const newComplaint = event.detail
      
      // Convert to Complaint type
      const formattedComplaint: Complaint = {
        _id: newComplaint._id || newComplaint.id,
        title: newComplaint.title,
        description: newComplaint.description,
        category: newComplaint.category,
        priority: newComplaint.priority,
        status: 'assigned',
        createdAt: newComplaint.createdAt || new Date().toISOString(),
        dueDate: newComplaint.dueDate,
        assignedStaffName: newComplaint.assignedStaffName,
        studentName: newComplaint.studentName,
        studentCollegeId: newComplaint.studentCollegeId,
        studentEmail: newComplaint.studentEmail
      };
      
      // Add new complaint immediately
      addNewComplaint(formattedComplaint)
      
      // Show success notification
      alert(`✅ Complaint "${newComplaint.title}" submitted successfully!\n\nComplaint ID: ${newComplaint._id}\nAssigned to: ${newComplaint.assignedStaffName}\nExpected Resolution: ${new Date(newComplaint.dueDate).toLocaleDateString()}`)
    }

    // @ts-ignore
    window.addEventListener('complaintSubmitted', handleComplaintSubmitted)
    
    return () => {
      // @ts-ignore
      window.removeEventListener('complaintSubmitted', handleComplaintSubmitted)
    }
  }, [])

  // Listen for complaint status updates from staff
  useEffect(() => {
    const handleComplaintStatusUpdate = (event: CustomEvent) => {
      const { complaintId, status, staffName, resolution, escalationLevel, updatedAt } = event.detail;
      console.log('Status update received:', complaintId, status, staffName);
      
      setComplaints(prevComplaints => {
        const updatedComplaints = prevComplaints.map(complaint => {
          if (complaint._id === complaintId) {
            console.log(`Updating complaint ${complaintId} status from ${complaint.status} to ${status}`);
            return { 
              ...complaint, 
              status: status,
              assignedStaffName: staffName || complaint.assignedStaffName
            };
          }
          return complaint;
        });
        
        return updatedComplaints;
      });
      
      // Update localStorage
      try {
        const currentComplaints = JSON.parse(localStorage.getItem('studentComplaints') || '[]');
        const updatedComplaints = currentComplaints.map((comp: any) => {
          if (comp.id === complaintId || comp._id === complaintId) {
            return { 
              ...comp, 
              status: status,
              assignedStaffName: staffName || comp.assignedStaffName,
              updatedAt: updatedAt || new Date().toISOString()
            };
          }
          return comp;
        });
        localStorage.setItem('studentComplaints', JSON.stringify(updatedComplaints));
      } catch (error) {
        console.error('Error updating localStorage status:', error);
      }
      
      // Show notification for status updates
      if (status === 'resolved') {
        const updatedComplaint = complaints.find(c => c._id === complaintId);
        if (updatedComplaint) {
          alert(`🎉 Your complaint "${updatedComplaint.title}" has been resolved!\n\nResolved by: ${staffName}\nPlease consider rating the service quality.`);
        }
      } else if (status === 'in-progress') {
        const updatedComplaint = complaints.find(c => c._id === complaintId);
        if (updatedComplaint) {
          alert(`🔄 Your complaint "${updatedComplaint.title}" is now in progress.\n\nBeing handled by: ${staffName}`);
        }
      } else if (status === 'escalated') {
        const updatedComplaint = complaints.find(c => c._id === complaintId);
        if (updatedComplaint) {
          alert(`🚨 Your complaint "${updatedComplaint.title}" has been escalated to Level ${escalationLevel} for higher priority attention.\n\nHandled by: ${staffName}`);
        }
      }
      
      // Refresh stats after status update
      setTimeout(fetchComplaints, 500);
    };

    // Listen for both custom event and localStorage updates
    // @ts-ignore
    window.addEventListener('complaintStatusUpdated', handleComplaintStatusUpdate);
    
    return () => {
      // @ts-ignore
      window.removeEventListener('complaintStatusUpdated', handleComplaintStatusUpdate);
    };
  }, [complaints]);

  // Listen for storage events (other tabs)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'studentComplaints' && event.newValue) {
        console.log('Storage update detected, refreshing complaints...');
        fetchComplaints();
      }
      
      if (event.key === 'studentComplaintStatusUpdate' && event.newValue) {
        try {
          const statusUpdate = JSON.parse(event.newValue);
          const { complaintId, status, staffName } = statusUpdate;
          
          console.log('Student complaint status update from storage:', complaintId, status);
          
          setComplaints(prevComplaints => {
            const updatedComplaints = prevComplaints.map(complaint => {
              if (complaint._id === complaintId) {
                return { 
                  ...complaint, 
                  status: status,
                  assignedStaffName: staffName || complaint.assignedStaffName
                };
              }
              return complaint;
            });
            
            return updatedComplaints;
          });
          
          setTimeout(fetchComplaints, 500);
        } catch (error) {
          console.error('Error processing status update from storage:', error);
        }
      }
      
      // Listen for rating updates from other tabs
      if (event.key === 'complaintRatingUpdate' && event.newValue) {
        try {
          const ratingUpdate = JSON.parse(event.newValue);
          const { complaintId, rating, comment, ratedAt } = ratingUpdate;
          
          console.log('Rating update from storage:', complaintId, rating);
          
          setComplaints(prevComplaints => {
            const updatedComplaints = prevComplaints.map(complaint => {
              if (complaint._id === complaintId) {
                return { 
                  ...complaint, 
                  rating: {
                    score: rating,
                    comment: comment,
                    ratedAt: ratedAt
                  }
                };
              }
              return complaint;
            });
            
            return updatedComplaints;
          });
          
          setTimeout(fetchComplaints, 500);
        } catch (error) {
          console.error('Error processing rating update from storage:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleViewDetails = (complaintId: string) => {
    router.push(`/student/complaints/${complaintId}`)
  }

  const handleRefresh = () => {
    fetchComplaints()
  }

  const handleRateComplaint = (complaint: Complaint) => {
    setRatingModal({ complaint })
  }

  const handleRatingSubmit = async (rating: number, comment: string) => {
    if (ratingModal.complaint) {
      await submitRating(ratingModal.complaint._id, rating, comment)
    }
  }

  const statsData = [
    {
      title: "Total Complaints",
      value: stats.total.toString(),
      description: "All time submissions",
      icon: FileText,
      color: "text-blue-500",
    },
    {
      title: "Pending",
      value: stats.pending.toString(),
      description: "Awaiting assignment",
      icon: Clock,
      color: "text-yellow-500",
    },
    {
      title: "In Progress",
      value: stats.inProgress.toString(),
      description: "Being resolved",
      icon: AlertTriangle,
      color: "text-orange-500",
    },
    {
      title: "Resolved",
      value: stats.resolved.toString(),
      description: "Successfully completed",
      icon: CheckCircle,
      color: "text-green-500",
    },
  ]

  const recentComplaints = complaints.slice(0, 5)

  return (
    <div className="min-h-screen gradient-bg">
      <StudentSidebar />

      {/* Rating Modal */}
      <RatingModal
        complaint={ratingModal.complaint}
        onClose={() => setRatingModal({ complaint: null })}
        onSubmit={handleRatingSubmit}
      />

      <div className="lg:ml-64 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Student Dashboard</h1>
              <p className="text-muted-foreground">
                {isLoading ? "Loading your complaints..." : `Welcome back! You have ${stats.total} complaints in total.`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={isLoading}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Link href="/student/submit">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Submit New Complaint
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsData.map((stat) => (
              <Card key={stat.title} className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{isLoading ? "..." : stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Complaints */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Recent Complaints</CardTitle>
                  <CardDescription>
                    {recentComplaints.length > 0 
                      ? `Your ${recentComplaints.length} most recent complaints` 
                      : "Your submitted complaints will appear here"}
                    {stats.rated > 0 && ` • ${stats.rated} complaints rated`}
                  </CardDescription>
                </div>
                <Link href="/student/complaints">
                  <Button variant="outline">View All Complaints</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Loading your complaints...</p>
                </div>
              ) : recentComplaints.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No complaints yet</h3>
                  <p className="text-muted-foreground mb-4">Submit your first complaint to get started</p>
                  <Link href="/student/submit">
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Submit Your First Complaint
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentComplaints.map((complaint) => (
                    <div
                      key={complaint._id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-lg">{complaint.title}</h3>
                          <Badge className={`${getStatusColor(complaint.status)} text-white text-xs`}>
                            {complaint.status.replace('-', ' ').toUpperCase()}
                          </Badge>
                          <Badge className={`${getPriorityColor(complaint.priority)} text-white text-xs`}>
                            {complaint.priority.toUpperCase()}
                          </Badge>
                          {complaint.status === 'resolved' && complaint.rating && (
                            <Badge variant="outline" className="text-xs border-yellow-200 bg-yellow-50">
                              ⭐ Rated
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>
                            <strong>Category:</strong> {complaint.category} • 
                            <strong> Created:</strong> {new Date(complaint.createdAt).toLocaleDateString()}
                          </p>
                          <p>
                            <strong>Assigned to:</strong> {complaint.assignedStaffName || 'Not assigned yet'} • 
                            <strong> Due:</strong> {complaint.dueDate ? new Date(complaint.dueDate).toLocaleDateString() : 'Not set'}
                          </p>
                          {/* Show star ratings ONLY for resolved complaints */}
                          {complaint.status === 'resolved' && complaint.rating && (
                            <div className="flex items-center gap-2">
                              <strong>Your Rating:</strong>
                              {renderStarRating(complaint.rating.score)}
                              {complaint.rating.comment && (
                                <span className="text-xs">- "{complaint.rating.comment}"</span>
                              )}
                            </div>
                          )}
                          <p className="text-xs">
                            <strong>ID:</strong> {complaint._id}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0 ml-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewDetails(complaint._id)}
                          className="gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </Button>
                        {/* Show Rate Service button ONLY for resolved complaints without rating */}
                        {complaint.status === 'resolved' && !complaint.rating && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRateComplaint(complaint)}
                            className="gap-2"
                          >
                            <Star className="w-4 h-4" />
                            Rate Service
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Resolution Insights
                </CardTitle>
                <CardDescription>Your complaint resolution statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Resolution Time</span>
                    <span className="font-medium">
                      {stats.resolved > 0 ? '3.5 days' : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Resolution Rate</span>
                    <span className="font-medium">
                      {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Complaints</span>
                    <span className="font-medium">{stats.pending + stats.inProgress}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Complaints Rated</span>
                    <span className="font-medium">{stats.rated} / {stats.resolved}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your complaints</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/student/submit">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Plus className="w-4 h-4" />
                      Submit New Complaint
                    </Button>
                  </Link>
                  <Link href="/student/complaints">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <FileText className="w-4 h-4" />
                      View All Complaints ({stats.total})
                    </Button>
                  </Link>
                  {stats.resolved - stats.rated > 0 && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      onClick={() => {
                        const unratedComplaint = complaints.find(c => c.status === 'resolved' && !c.rating)
                        if (unratedComplaint) {
                          handleRateComplaint(unratedComplaint)
                        }
                      }}
                    >
                      <Star className="w-4 h-4" />
                      Rate Resolved Complaints ({stats.resolved - stats.rated})
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}