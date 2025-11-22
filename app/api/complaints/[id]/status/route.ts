import { NextResponse } from 'next/server';
import { sendComplaintUpdateEmail } from '@/lib/email';
import { sendProfessionalStatusUpdateSMS } from '@/lib/sms';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const complaintId = params.id;
    
    const {
      status,
      updateMessage,
      resolvedBy,
      studentEmail,
      studentPhone,
      studentName,
      complaintTitle
    } = body;

    if (!status || !updateMessage) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // TODO: Update complaint status in database
    // const updatedComplaint = await db.complaints.update({
    //   where: { id: complaintId },
    //   data: { 
    //     status,
    //     resolvedBy,
    //     resolvedAt: status === 'resolved' ? new Date() : null
    //   }
    // });

    // Send status update notification to student
    if (studentEmail) {
      await sendComplaintUpdateEmail(
        studentEmail,
        studentName,
        complaintTitle,
        complaintId,
        updateMessage,
        status,
        resolvedBy
      );
    }

    // Send status update SMS to student
    if (studentPhone) {
      await sendProfessionalStatusUpdateSMS(
        studentPhone,
        studentName,
        complaintTitle,
        complaintId,
        status
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Complaint status updated successfully',
      complaintId,
      status
    });

  } catch (error: any) {
    console.error('Complaint status update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update complaint status',
      message: error.message 
    }, { status: 500 });
  }
}