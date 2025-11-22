// app/api/staff/complaints/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Complaint from '@/models/Complaint';

export async function GET(request: NextRequest) {
  try {
    // Check authentication using your existing JWT system
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Extract staff ID from token (you might need to decode the JWT)
    // For now, we'll get it from a query parameter or header
    const staffId = request.headers.get('x-staff-id') || new URL(request.url).searchParams.get('staffId');
    
    if (!staffId) {
      return NextResponse.json({ error: 'Staff ID required' }, { status: 400 });
    }

    // Get complaints assigned to this staff member
    const complaints = await Complaint.find({
      assignedStaffId: staffId,
      status: { $in: ['assigned', 'in-progress', 'pending'] }
    })
    .sort({ createdAt: -1 })
    .lean();

    const formattedComplaints = complaints.map((complaint: any) => ({
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
      assignedStaffName: complaint.assignedStaffName,
      assignedStaffId: complaint.assignedStaffId
    }));

    return NextResponse.json({
      success: true,
      data: formattedComplaints
    });

  } catch (error: any) {
    console.error('Error fetching staff complaints:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch complaints' },
      { status: 500 }
    );
  }
}