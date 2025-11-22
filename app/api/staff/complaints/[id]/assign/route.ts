// app/api/complaints/[id]/assign/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Complaint from '@/models/Complaint';
import Staff from '@/models/Staff';

// Define the Staff interface to include currentWorkload
interface IStaff {
  _id: any;
  name: string;
  email: string;
  department: string;
  role: string;
  collegeId: string;
  isActive: boolean;
  assignedComplaints: number;
  resolvedComplaints: number;
  escalatedComplaints: number;
  performanceScore: number;
  currentWorkload: number;
  maxEscalationLevel: number;
  category?: string;
  phone?: string;
  password?: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const complaintId = params.id;
    const { staffId, assignedBy } = await request.json();

    const complaint = await Complaint.findById(complaintId);
    const staff = await Staff.findById(staffId) as any; // Use any to bypass TypeScript issues

    if (!complaint || !staff) {
      return NextResponse.json(
        { success: false, error: 'Complaint or staff not found' },
        { status: 404 }
      );
    }

    // Update complaint assignment
    complaint.assignedStaffId = staffId;
    complaint.assignedStaffName = staff.name;
    complaint.status = 'assigned';
    complaint.assignedAt = new Date();
    
    // Add to assignment history
    if (!complaint.assignmentHistory) {
      complaint.assignmentHistory = [];
    }
    
    complaint.assignmentHistory.push({
      assignedBy: assignedBy,
      assignedTo: staffId,
      assignedAt: new Date(),
      staffName: staff.name
    });

    // Update staff workload - handle both cases where currentWorkload might not exist
    const currentWorkload = staff.currentWorkload || 0;
    staff.currentWorkload = currentWorkload + 1;
    staff.assignedComplaints = (staff.assignedComplaints || 0) + 1;

    await Promise.all([complaint.save(), staff.save()]);

    // Dispatch event for real-time updates
    const assignedComplaint = {
      _id: complaint._id.toString(),
      title: complaint.title,
      description: complaint.description,
      status: complaint.status,
      priority: complaint.priority,
      category: complaint.category,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt,
      dueDate: complaint.dueDate,
      escalationLevel: complaint.escalationLevel || 0,
      studentName: complaint.studentName,
      studentEmail: complaint.studentEmail,
      studentPhone: complaint.studentPhone,
      studentCollegeId: complaint.studentCollegeId,
      assignedAt: complaint.assignedAt,
      assignedStaffName: staff.name,
      assignedStaffId: staffId
    };

    return NextResponse.json({
      success: true,
      message: 'Complaint assigned successfully',
      assignedStaffName: staff.name,
      complaint: assignedComplaint
    });

  } catch (error: any) {
    console.error('Error assigning complaint:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to assign complaint' },
      { status: 500 }
    );
  }
}