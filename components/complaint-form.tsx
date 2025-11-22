"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, MapPin, User, Clock, AlertCircle, Paperclip, X, Upload, Star, MessageCircle, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface FileWithPreview {
  file: File
  preview: string
  id: string
}

// Level 1 Staff Assignment based on your Authority Management data
const level1StaffAssignment = {
  library: [
    { id: '1', name: "Library Assistant", role: "Assistant", email: "library.assistant@college.edu", phone: "9876543210" }
  ],
  hostel: [
    { id: '5', name: "Assistant Warden", role: "Supervisor", email: "assistant.warden@college.edu", phone: "9876543214" }
  ],
  academic: [
    { id: '6', name: "Academic Coordinator", role: "Coordinator", email: "academic.coordinator@college.edu", phone: "9876543215" }
  ],
  infrastructure: [
    { id: '8', name: "Maintenance Engineer", role: "Engineer", email: "maintenance@college.edu", phone: "9876543217" },
    { id: '9', name: "Civil Engineer", role: "Supervisor", email: "civil.engineer@college.edu", phone: "9876543218" }
  ],
  cafeteria: [
    { id: '10', name: "Cafeteria Manager", role: "Manager", email: "cafeteria.manager@college.edu", phone: "9876543219" }
  ],
  sports: [
    { id: '11', name: "Sports Coordinator", role: "Coordinator", email: "sports.coordinator@college.edu", phone: "9876543220" }
  ],
  other: [
    { id: '12', name: "General Administrator", role: "Administrator", email: "general.admin@college.edu", phone: "9876543221" }
  ]
}

export function ComplaintForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
    location: "",
  })
  const [dueDate, setDueDate] = useState<Date>()
  const [assignedStaff, setAssignedStaff] = useState("")
  const [assignedStaffRole, setAssignedStaffRole] = useState("")
  const [availableStaff, setAvailableStaff] = useState<Array<{id: string, name: string, role: string, email: string, phone: string}>>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [submittedComplaintId, setSubmittedComplaintId] = useState("")
  const router = useRouter()

  const categories = [
    { value: "hostel", label: "Hostel" },
    { value: "academic", label: "Academic" },
    { value: "infrastructure", label: "Infrastructure" },
    { value: "library", label: "Library" },
    { value: "cafeteria", label: "Cafeteria" },
    { value: "sports", label: "Sports" },
    { value: "other", label: "Other" }
  ]

  const priorities = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" }
  ]

  // File handling functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (!selectedFiles) return

    const newFiles: FileWithPreview[] = []
    
    Array.from(selectedFiles).forEach(file => {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 5MB.`)
        return
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'video/mp4', 'video/avi']
      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} is not a supported format.`)
        return
      }

      const fileWithPreview: FileWithPreview = {
        file,
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substr(2, 9)
      }
      newFiles.push(fileWithPreview)
    })

    setFiles(prev => [...prev, ...newFiles])
    event.target.value = '' // Reset input
  }

  const removeFile = (id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id)
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return prev.filter(f => f.id !== id)
    })
  }

  const uploadFiles = async (complaintId: string): Promise<string[]> => {
    if (files.length === 0) return []

    const uploadedUrls: string[] = []
    setIsUploading(true)

    try {
      for (const fileWithPreview of files) {
        const formData = new FormData()
        formData.append('file', fileWithPreview.file)
        formData.append('complaintId', complaintId)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const result = await response.json()
          uploadedUrls.push(result.fileUrl)
        } else {
          console.error('Failed to upload file:', fileWithPreview.file.name)
        }
      }
    } catch (error) {
      console.error('File upload error:', error)
    } finally {
      setIsUploading(false)
    }

    return uploadedUrls
  }

  // Calculate due date based on priority
  const calculateDueDate = (priority: string) => {
    const today = new Date()
    const dueDate = new Date(today)
    
    switch (priority) {
      case "urgent":
        dueDate.setDate(today.getDate() + 1) // 1 day
        break
      case "high":
        dueDate.setDate(today.getDate() + 2) // 2 days
        break
      case "medium":
        dueDate.setDate(today.getDate() + 3) // 3 days
        break
      case "low":
        dueDate.setDate(today.getDate() + 7) // 7 days
        break
      default:
        dueDate.setDate(today.getDate() + 3) // Default 3 days
    }
    
    return dueDate
  }

  // Get available staff for category and auto-assign the first one
  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }))
    
    // Get available Level 1 staff for the selected category
    const staffForCategory = level1StaffAssignment[value as keyof typeof level1StaffAssignment] || []
    setAvailableStaff(staffForCategory)
    
    // Auto-assign the first available staff member
    if (staffForCategory.length > 0) {
      const firstStaff = staffForCategory[0]
      setAssignedStaff(firstStaff.name)
      setAssignedStaffRole(firstStaff.role)
    } else {
      setAssignedStaff("")
      setAssignedStaffRole("")
    }
    
    // Auto-set due date based on priority
    const calculatedDueDate = calculateDueDate(formData.priority)
    setDueDate(calculatedDueDate)
  }

  // Handle manual staff selection
  const handleStaffChange = (staffName: string) => {
    setAssignedStaff(staffName)
    const selectedStaff = availableStaff.find(staff => staff.name === staffName)
    if (selectedStaff) {
      setAssignedStaffRole(selectedStaff.role)
    }
  }

  const handlePriorityChange = (value: string) => {
    setFormData(prev => ({ ...prev, priority: value }))
    // Update due date when priority changes
    const calculatedDueDate = calculateDueDate(value)
    setDueDate(calculatedDueDate)
  }

  // NEW FUNCTION: Dispatch real-time events for immediate dashboard updates
  const dispatchRealTimeUpdate = (complaintData: any) => {
    // Create complaint object for real-time updates
    const realTimeComplaint = {
      _id: complaintData._id || `temp-${Date.now()}`,
      title: complaintData.title,
      description: complaintData.description,
      category: complaintData.category,
      priority: complaintData.priority,
      status: "pending",
      createdAt: new Date().toISOString(),
      dueDate: complaintData.dueDate,
      assignedStaffName: complaintData.assignedStaffName,
      studentName: complaintData.studentName,
      studentCollegeId: complaintData.studentCollegeId,
      studentEmail: complaintData.studentEmail,
      studentPhone: "",
      department: ""
    };

    console.log("Dispatching real-time complaint update:", realTimeComplaint);

    // Dispatch custom event for same-tab updates (student dashboard)
    const complaintSubmittedEvent = new CustomEvent('complaintSubmitted', {
      detail: realTimeComplaint
    });
    window.dispatchEvent(complaintSubmittedEvent);

    // Dispatch storage event for cross-tab updates
    const storageUpdateEvent = new StorageEvent('storage', {
      key: 'newComplaint',
      newValue: JSON.stringify(realTimeComplaint)
    });
    window.dispatchEvent(storageUpdateEvent);

    // Update localStorage for admin dashboard
    const adminComplaints = JSON.parse(localStorage.getItem('adminComplaints') || '[]');
    const updatedAdminComplaints = [realTimeComplaint, ...adminComplaints];
    localStorage.setItem('adminComplaints', JSON.stringify(updatedAdminComplaints));

    // Dispatch admin update event
    const adminUpdateEvent = new CustomEvent('newComplaintForAdmin', {
      detail: realTimeComplaint
    });
    window.dispatchEvent(adminUpdateEvent);

    // Also update student complaints in localStorage
    const studentComplaints = JSON.parse(localStorage.getItem('studentComplaints') || '[]');
    const updatedStudentComplaints = [realTimeComplaint, ...studentComplaints];
    localStorage.setItem('studentComplaints', JSON.stringify(updatedStudentComplaints));

    return realTimeComplaint;
  };

  // Function to save complaint to localStorage (for admin dashboard)
  const saveComplaintToStorage = (complaintData: any) => {
    // Get current complaints from localStorage
    const savedComplaints = localStorage.getItem('studentComplaints');
    const currentComplaints = savedComplaints ? JSON.parse(savedComplaints) : [];
    
    // Generate new ID
    const complaintId = `CMP-${String(currentComplaints.length + 1).padStart(3, '0')}`;
    
    // Create complaint with all required fields for complaint-list component
    const newComplaint = {
      id: complaintId,
      title: complaintData.title,
      description: complaintData.description,
      category: complaintData.category,
      priority: complaintData.priority,
      status: "pending", // Use "pending" instead of "assigned" to match complaint-list
      createdAt: new Date().toISOString().split('T')[0],
      assignedTo: complaintData.assignedStaffName || "Pending Assignment",
      dueDate: complaintData.dueDate,
      rating: null,
      feedback: "",
      // Include student information for admin dashboard
      studentName: complaintData.studentName,
      studentEmail: complaintData.studentEmail,
      studentId: complaintData.studentCollegeId,
      location: complaintData.location || "Not specified",
      // Include staff assignment details
      assignedStaffId: complaintData.assignedStaffId,
      assignedStaffRole: complaintData.assignedStaffRole
    };
    
    // Update localStorage
    const updatedComplaints = [newComplaint, ...currentComplaints];
    localStorage.setItem('studentComplaints', JSON.stringify(updatedComplaints));
    
    // Dispatch storage event to notify other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'studentComplaints',
      newValue: JSON.stringify(updatedComplaints)
    }));

    // Also dispatch a custom event for same-tab communication
    window.dispatchEvent(new CustomEvent('complaintsUpdated', {
      detail: { type: 'COMPLAINTS_UPDATED' }
    }));
    
    return newComplaint;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const userData = localStorage.getItem("user")
      if (!userData) {
        alert("Please login to submit a complaint")
        router.push("/auth/login")
        return
      }

      const user = JSON.parse(userData)
      
      // Validate required fields
      if (!formData.title || !formData.description || !formData.category) {
        alert("Please fill in all required fields")
        return
      }

      // Ensure assigned staff is set
      if (!assignedStaff && availableStaff.length > 0) {
        const firstStaff = availableStaff[0]
        setAssignedStaff(firstStaff.name)
        setAssignedStaffRole(firstStaff.role)
      }

      // Ensure due date is set
      if (!dueDate) {
        setDueDate(calculateDueDate(formData.priority))
      }

      // Get the selected staff details
      const selectedStaffDetails = availableStaff.find(staff => staff.name === assignedStaff)

      // UPDATED: Complaint data that matches your Complaint model schema
      const complaintData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        location: formData.location,
        assignedStaffName: assignedStaff,
        assignedStaffId: selectedStaffDetails?.id,
        assignedStaffRole: assignedStaffRole,
        dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : format(calculateDueDate(formData.priority), "yyyy-MM-dd"),
        submittedBy: user.id,
        studentName: user.name,
        studentEmail: user.email,
        studentCollegeId: user.collegeId,
        status: "pending"
      }

      console.log("Saving complaint to localStorage:", complaintData);

      // Save to localStorage for admin dashboard and student complaint list
      const savedComplaint = saveComplaintToStorage(complaintData);
      setSubmittedComplaintId(savedComplaint.id);

      // NEW: Dispatch real-time events for immediate dashboard updates
      const realTimeComplaint = dispatchRealTimeUpdate({
        ...complaintData,
        _id: savedComplaint.id
      });

      // Also send to API if needed (your existing functionality)
      try {
        const response = await fetch("/api/complaints", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(complaintData),
        })

        if (response.ok) {
          const result = await response.json();
          console.log("API submission successful:", result);
          
          // Update the real-time complaint with the actual MongoDB ID
          if (result.data && result.data._id) {
            const updatedComplaint = {
              ...realTimeComplaint,
              _id: result.data._id
            };
            
            // Dispatch update with real MongoDB ID
            const updateEvent = new CustomEvent('complaintSubmitted', {
              detail: updatedComplaint
            });
            window.dispatchEvent(updateEvent);
          }
        } else {
          const result = await response.json()
          console.error("API submission failed:", result.error)
          // Don't alert here as localStorage save was successful
        }
      } catch (apiError) {
        console.error("API submission error:", apiError)
        // Continue even if API fails since localStorage save was successful
      }

      // Upload files if any
      let fileUrls: string[] = []
      if (files.length > 0) {
        fileUrls = await uploadFiles(savedComplaint.id)
      }

      // Reset form and show success message
      setFormData({
        title: "",
        description: "",
        category: "",
        priority: "medium",
        location: "",
      })
      setAssignedStaff("")
      setAssignedStaffRole("")
      setAvailableStaff([])
      setDueDate(undefined)
      setFiles([])
      setShowPreview(false)
      setShowSuccess(true);

    } catch (error) {
      console.error("Complaint submission error:", error)
      alert("Failed to submit complaint. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePreview = () => {
    if (!formData.title || !formData.description || !formData.category) {
      alert("Please fill in all required fields before preview")
      return
    }
    setShowPreview(true)
  }

  // If showing success message, display that instead of the form
  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="w-8 h-8" />
              Complaint Submitted Successfully!
            </CardTitle>
            <CardDescription>
              Your complaint has been assigned and is now being processed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            {/* Success Details */}
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-center gap-3">
                  <User className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Assigned to: {assignedStaff}</p>
                    <p className="text-sm text-green-700">{assignedStaffRole}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-medium text-blue-800">Category</p>
                  <p className="text-blue-700">{categories.find(cat => cat.value === formData.category)?.label}</p>
                </div>
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="font-medium text-orange-800">Priority</p>
                  <p className="text-orange-700">{formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}</p>
                </div>
              </div>

              {dueDate && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <p className="font-medium text-purple-800">
                      Expected Resolution: {format(dueDate, "dd/MM/yyyy")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Rating Information */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Star className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800 text-left">
                  <p className="font-medium">Rating System</p>
                  <p className="mt-1">
                    You'll be able to rate this complaint and provide feedback once it has been <span className="font-semibold">resolved</span>. 
                    Check your dashboard for status updates.
                  </p>
                </div>
              </div>
            </div>

            {/* Next Steps Information */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800 text-left">
                  <p className="font-medium">What happens next?</p>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Your complaint is now with {assignedStaff}</li>
                    <li>You'll receive updates on the progress</li>
                    <li>Once resolved, you can rate the service</li>
                    <li>Check your dashboard for real-time updates</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowSuccess(false);
                  // Reset form for new complaint
                  setFormData({
                    title: "",
                    description: "",
                    category: "",
                    priority: "medium",
                    location: "",
                  });
                  setAssignedStaff("");
                  setAssignedStaffRole("");
                }}
                className="flex-1"
              >
                Submit Another Complaint
              </Button>
              <Button
                onClick={() => router.push("/student/dashboard")}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Go to Dashboard
              </Button>
            </div>

            {/* Complaint ID Reference */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Reference ID:</span> {submittedComplaintId}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Keep this ID for future reference when checking complaint status
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Complaint Form */}
      <Card>
        <CardHeader>
          <CardTitle>Complaint Details</CardTitle>
          <CardDescription>Provide detailed information about your issue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Complaint Title *</Label>
              <Input
                id="title"
                placeholder="Brief description of the issue"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide detailed information about the issue..."
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Staff Assignment - Only show when category is selected */}
            {formData.category && availableStaff.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="staff">Assign to Staff *</Label>
                <Select value={assignedStaff} onValueChange={handleStaffChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStaff.map((staff) => (
                      <SelectItem key={staff.id} value={staff.name}>
                        {staff.name} ({staff.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Level 1 staff available for {categories.find(cat => cat.value === formData.category)?.label} category
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select value={formData.priority} onValueChange={handlePriorityChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">
                <MapPin className="w-4 h-4 inline mr-2" />
                Location (Optional)
              </Label>
              <Input
                id="location"
                placeholder="e.g., Room 204, Main Building, Library Ground Floor, etc."
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            {/* File Upload Section */}
            <div className="space-y-3">
              <Label htmlFor="attachments">
                <Paperclip className="w-4 h-4 inline mr-2" />
                Attachments (Optional)
              </Label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Input
                  id="attachments"
                  type="file"
                  multiple
                  accept="image/*,.pdf,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Label htmlFor="attachments" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Click to upload files
                      </p>
                      <p className="text-xs text-gray-500">
                        Supports images, PDFs, videos (max 5MB each)
                      </p>
                    </div>
                  </div>
                </Label>
              </div>

              {/* File Preview */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    {files.length} file(s) selected
                  </p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {files.map((fileWithPreview) => (
                      <div
                        key={fileWithPreview.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {fileWithPreview.file.type.startsWith('image/') ? (
                            <img
                              src={fileWithPreview.preview}
                              alt={fileWithPreview.file.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                              <Paperclip className="w-5 h-5 text-primary" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                              {fileWithPreview.file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(fileWithPreview.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(fileWithPreview.id)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handlePreview}
                disabled={!formData.title || !formData.description || !formData.category || !assignedStaff}
              >
                Preview Assignment
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || isUploading}
              >
                {(isSubmitting || isUploading) ? "Uploading..." : "Submit Complaint"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Assignment Preview */}
      {showPreview && (
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Complaint Assignment Preview</CardTitle>
            <CardDescription>Your complaint will be automatically assigned as follows:</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Assigned To Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Assigned To</Label>
                <div className="flex items-center gap-2 p-3 border rounded-lg">
                  <User className="w-4 h-4 text-primary" />
                  <div>
                    <span className="font-medium">{assignedStaff}</span>
                    <p className="text-sm text-muted-foreground">{assignedStaffRole}</p>
                  </div>
                </div>
              </div>
              
              {assignedStaff && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Level 1 Assignment</p>
                    <p className="mt-1">
                      This complaint will be handled by Level 1 staff. If unresolved within timeframe, it will be escalated to Level 2.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Due Date Section */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                <Clock className="w-4 h-4 inline mr-2" />
                Expected Resolution
              </Label>
              <div className="p-3 border rounded-lg">
                <span className="font-medium">
                  {dueDate ? format(dueDate, "dd/MM/yyyy") : "Not set"}
                </span>
              </div>
            </div>

            {/* Priority & Category Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
                <div className={cn(
                  "p-3 border rounded-lg font-medium",
                  formData.priority === "urgent" && "bg-red-50 border-red-200 text-red-800",
                  formData.priority === "high" && "bg-orange-50 border-orange-200 text-orange-800",
                  formData.priority === "medium" && "bg-yellow-50 border-yellow-200 text-yellow-800",
                  formData.priority === "low" && "bg-green-50 border-green-200 text-green-800"
                )}>
                  {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                <div className="p-3 border rounded-lg">
                  <span className="font-medium">
                    {categories.find(cat => cat.value === formData.category)?.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Attachments Preview */}
            {files.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  <Paperclip className="w-4 h-4 inline mr-2" />
                  Attachments ({files.length})
                </Label>
                <div className="p-3 border rounded-lg">
                  <div className="space-y-2">
                    {files.slice(0, 3).map((fileWithPreview) => (
                      <div key={fileWithPreview.id} className="flex items-center gap-2 text-sm">
                        <Paperclip className="w-3 h-3 text-gray-500" />
                        <span className="truncate">{fileWithPreview.file.name}</span>
                      </div>
                    ))}
                    {files.length > 3 && (
                      <p className="text-xs text-gray-500">
                        +{files.length - 3} more files
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Information Note */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Level 1 Assignment System</p>
                  <p className="mt-1">
                    Your complaint is assigned to Level 1 staff based on category. If not resolved within the due date, it will be automatically escalated to Level 2 (Department Head).
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPreview(false)}
                className="w-full"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting || isUploading}
                className="w-full"
              >
                {(isSubmitting || isUploading) ? "Uploading..." : "Confirm & Submit"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty Preview State */}
      {!showPreview && (
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Assignment Preview</CardTitle>
            <CardDescription>Fill in the complaint details to see assignment preview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>Complete the form to see how your complaint will be assigned</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}