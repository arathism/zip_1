import { connectDB } from '@/lib/db';
import Complaint from '@/models/Complaint';
import Staff from '@/models/Staff';

export async function PUT(request: Request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { 
      complaintId, 
      status, 
      remarks, 
      resolutionDetails, 
      resolutionAttachments = [] 
    } = body;

    if (!complaintId) {
      return Response.json({ error: 'Complaint ID required' }, { status: 400 });
    }

    const updateData: any = {
      status,
      remarks,
      updatedAt: new Date()
    };

    if (status === 'resolved') {
      if (!resolutionDetails) {
        return Response.json({ error: 'Resolution details required for resolved complaints' }, { status: 400 });
      }
      updateData.resolutionDetails = resolutionDetails;
      updateData.resolvedAt = new Date();
      
      const complaint = await Complaint.findById(complaintId);
      if (complaint && complaint.assignedTo) {
        const staff = await Staff.findById(complaint.assignedTo);
        if (staff) {
          staff.resolvedComplaints += 1;
          await (staff as any).updatePerformance();
        }
      }
    }

    if (resolutionAttachments.length > 0) {
      const complaint = await Complaint.findById(complaintId);
      const existingAttachments = complaint?.attachments || [];
      updateData.attachments = [...existingAttachments, ...resolutionAttachments];
    }

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      complaintId,
      updateData,
      { new: true }
    ).populate('submittedBy', 'name email collegeId');

    if (!updatedComplaint) {
      return Response.json({ error: 'Complaint not found' }, { status: 404 });
    }

    return Response.json({ 
      message: 'Complaint updated successfully',
      complaint: updatedComplaint
    }, { status: 200 });

  } catch (error: any) {
    console.error('Complaint update error:', error);
    return Response.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}