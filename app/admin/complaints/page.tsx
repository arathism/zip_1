// app/admin/complaints/page.tsx
"use client"

import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Search, Filter, UserPlus, Clock, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react"
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
}

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

export default function AllComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [assigningComplaint, setAssigningComplaint] = useState<string | null>(null);

  useEffect(() => {
    fetchComplaints();
    fetchStaff();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/complaints');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const complaintsData = data.data.map((complaint: any) => ({
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
            overdue: isComplaintOverdue(complaint)
          }));
          
          setComplaints(complaintsData);
          setFilteredComplaints(complaintsData);
        }
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/staff');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAvailableStaff(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const isComplaintOverdue = (complaint: any): boolean => {
    if (!complaint.createdAt) return false;
    
    const created = new Date(complaint.createdAt);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    
    return complaint.status === 'pending' && daysDiff > 7;
  };

  const refreshData = () => {
    setRefreshing(true);
    fetchComplaints();
    fetchStaff();
  };

  // Filter complaints based on search and filters
  useEffect(() => {
    let filtered = complaints;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(complaint =>
        complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(complaint => complaint.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter(complaint => complaint.priority === priorityFilter);
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(complaint => complaint.category === categoryFilter);
    }

    setFilteredComplaints(filtered);
  }, [searchTerm, statusFilter, priorityFilter, categoryFilter, complaints]);

  const assignComplaintToStaff = async (complaintId: string, staffId: string) => {
    try {
      setAssigningComplaint(complaintId);
      
      const response = await fetch(`/api/complaints/${complaintId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staffId: staffId,
          assignedBy: 'Admin'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update local state
        setComplaints(prev => 
          prev.map(complaint => 
            complaint.id === complaintId 
              ? { 
                  ...complaint, 
                  assignedStaffName: data.assignedStaffName,
                  assignedStaffId: staffId,
                  status: 'in-progress' as const
                } 
              : complaint
          )
        );

        console.log(`✅ Complaint assigned successfully to ${data.assignedStaffName}`);
      }
    } catch (error) {
      console.error('Error assigning complaint:', error);
    } finally {
      setAssigningComplaint(null);
    }
  };

  const updateComplaintStatus = async (complaintId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/complaints/${complaintId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          updateMessage: `Status updated to ${newStatus} by Admin`
        }),
      });

      if (response.ok) {
        // Update local state
        setComplaints(prev => 
          prev.map(complaint => 
            complaint.id === complaintId ? { ...complaint, status: newStatus as any } : complaint
          )
        );
      }
    } catch (error) {
      console.error('Error updating complaint status:', error);
    }
  };

  const getStaffForCategory = (category: string) => {
    return availableStaff.filter(staff => 
      staff.isActive && 
      (staff.category === category || staff.category === 'all') &&
      staff.currentWorkload < 10 // Limit workload
    );
  };

  const getCategories = () => {
    const categories = [...new Set(complaints.map(complaint => complaint.category))];
    return categories.sort();
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg">
        <AdminSidebar />
        <div className="lg:ml-64 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-lg text-muted-foreground">Loading complaints...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <AdminSidebar />

      <div className="lg:ml-64 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">All Complaints</h1>
              <p className="text-muted-foreground">
                Manage and assign all student complaints • {filteredComplaints.length} complaints found
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={refreshData} disabled={refreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Link href="/admin/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </div>

          {/* Filters */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search complaints..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="escalated">Escalated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority Filter */}
                <div>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {getCategories().map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Complaints List */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Complaints Management</CardTitle>
              <CardDescription>
                Assign complaints to staff members based on category and monitor resolution progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredComplaints.map((complaint) => {
                  const availableStaffForCategory = getStaffForCategory(complaint.category);
                  
                  return (
                    <div
                      key={complaint.id}
                      className={`flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg ${
                        complaint.overdue ? "border-red-500/50 bg-red-500/5" : "border-border"
                      }`}
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-medium text-sm lg:text-base">{complaint.title}</h4>
                          <Badge className={`${statusColors[complaint.status]} text-white text-xs`}>
                            {complaint.status}
                          </Badge>
                          <Badge className={`${priorityColors[complaint.priority]} text-white text-xs`}>
                            {complaint.priority}
                          </Badge>
                          {complaint.overdue && <Badge className="bg-red-500 text-white text-xs">Overdue</Badge>}
                          <Badge variant="outline" className="text-xs">{complaint.category}</Badge>
                        </div>
                        
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>
                            <strong>Student:</strong> {complaint.studentName} ({complaint.studentCollegeId}) • 
                            <strong> Submitted:</strong> {new Date(complaint.createdAt).toLocaleDateString()}
                          </p>
                          <p>
                            <strong>Email:</strong> {complaint.studentEmail} • 
                            <strong> Phone:</strong> {complaint.studentPhone || 'Not provided'}
                          </p>
                          {complaint.assignedStaffName && (
                            <p className="text-green-600">
                              <strong>Assigned to:</strong> {complaint.assignedStaffName}
                            </p>
                          )}
                        </div>

                        <p className="text-sm text-foreground line-clamp-2">
                          {complaint.description}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 mt-3 lg:mt-0 lg:ml-4">
                        {/* Assignment Section */}
                        {!complaint.assignedStaffName && (
                          <div className="flex flex-col gap-2">
                            <Select 
                              onValueChange={(staffId) => assignComplaintToStaff(complaint.id, staffId)}
                              disabled={assigningComplaint === complaint.id || availableStaffForCategory.length === 0}
                            >
                              <SelectTrigger className="w-full lg:w-48">
                                <SelectValue placeholder="Assign to staff" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableStaffForCategory.length === 0 ? (
                                  <SelectItem value="none" disabled>No staff available</SelectItem>
                                ) : (
                                  availableStaffForCategory.map(staff => (
                                    <SelectItem key={staff.id} value={staff.id}>
                                      {staff.name} ({staff.currentWorkload} tasks)
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            {availableStaffForCategory.length === 0 && (
                              <p className="text-xs text-red-500">No active staff for this category</p>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {complaint.status !== 'resolved' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updateComplaintStatus(complaint.id, 'resolved')}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Resolve
                            </Button>
                          )}
                          
                          {complaint.status === 'pending' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updateComplaintStatus(complaint.id, 'in-progress')}
                            >
                              <Clock className="w-4 h-4 mr-1" />
                              Start Progress
                            </Button>
                          )}

                          <Link href={`/admin/complaints/${complaint.id}`}>
                            <Button variant="ghost" size="sm">
                              <FileText className="w-4 h-4 mr-1" />
                              Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredComplaints.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No complaints found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {complaints.length === 0 ? 'No complaints in the system' : 'Try changing your filters'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}