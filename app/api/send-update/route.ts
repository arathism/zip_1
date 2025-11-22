// app/api/admin/send-update/route.ts
import { sendComplaintUpdateEmail } from '@/lib/email';
import { sendComplaintUpdateSMS } from '@/lib/sms';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const {
      complaintId,
      studentEmail,
      studentName,
      studentPhone,
      complaintTitle,
      updateMessage,
      currentStatus,
      assignedStaff
    } = body;

    // Validate required fields
    if (!complaintId || !studentEmail || !updateMessage) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let emailSent = false;
    let smsSent = false;

    // Send email update with proper error handling
    try {
      const emailResult = await sendComplaintUpdateEmail(
        studentEmail,
        studentName,
        complaintTitle,
        complaintId,
        updateMessage,
        currentStatus,
        assignedStaff
      );
      emailSent = emailResult?.success === true;
    } catch (emailError) {
      console.error('Failed to send update email:', emailError);
      emailSent = false;
    }

    // Send SMS update if phone number exists
    if (studentPhone) {
      try {
        const smsResult = await sendComplaintUpdateSMS(
          studentPhone,
          studentName,
          complaintTitle,
          complaintId,
          updateMessage
        );
        smsSent = smsResult?.success === true;
      } catch (smsError) {
        console.error('Failed to send update SMS:', smsError);
        smsSent = false;
      }
    }

    return Response.json({
      success: true,
      message: 'Update sent successfully',
      emailSent,
      smsSent
    }, { status: 200 });

  } catch (error: any) {
    console.error('Send update error:', error);
    return Response.json({ 
      error: 'Failed to send update',
      message: error.message
    }, { status: 500 });
  }
}