// app/api/complaints/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Complaint from '@/models/Complaint';
import Staff from '@/models/Staff';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const complaintId = params.id;
    const { status, updateMessage, resolvedBy } = await request.json();

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return NextResponse.json(
        { success: false, error: 'Complaint not found' },
        { status: 404 }
      );
    }

    // Update complaint status
    complaint.status = status;
    complaint.updatedAt = new Date();
    
    // Add to status history
    complaint.statusHistory.push({
      status: status,
      updatedBy: resolvedBy || 'System',
      timestamp: new Date(),
      message: updateMessage
    });

    // If resolved, update resolved information
    if (status === 'resolved') {
      complaint.resolvedAt = new Date();
      complaint.resolvedBy = resolvedBy;
      
      // Update staff performance metrics
      if (complaint.assignedStaffId) {
        await Staff.findByIdAndUpdate(complaint.assignedStaffId, {
          $inc: { resolvedComplaints: 1, currentWorkload: -1 }
        });
      }
    }

    await complaint.save();

    return NextResponse.json({
      success: true,
      message: 'Complaint status updated successfully',
      data: complaint
    });

  } catch (error: any) {
    console.error('Error updating complaint status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update complaint status' },
      { status: 500 }
    );
  }
}