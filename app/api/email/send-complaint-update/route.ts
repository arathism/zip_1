import { NextRequest, NextResponse } from 'next/server';
import { sendComplaintUpdateEmail } from '@/lib/email';

// Define the expected response type from the email function
interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  mode?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      studentEmail,
      studentName,
      complaintTitle,
      complaintId,
      updateMessage,
      currentStatus,
      assignedStaff
    } = body;

    console.log('📧 Sending complaint update email:', {
      studentEmail,
      studentName,
      complaintTitle,
      complaintId,
      currentStatus
    });

    // Use your existing email function and cast the result
    const result = await sendComplaintUpdateEmail(
      studentEmail,
      studentName,
      complaintTitle,
      complaintId,
      updateMessage,
      currentStatus,
      assignedStaff
    ) as EmailResult;

    if (result.success) {
      console.log('✅ Complaint update email sent successfully to:', studentEmail);
      return NextResponse.json({ 
        success: true, 
        message: 'Complaint update email sent successfully',
        messageId: result.messageId || `mock-${Date.now()}`
      });
    } else {
      console.error('❌ Failed to send complaint update email:', result.error);
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Failed to send email' 
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('❌ Error in send-complaint-update API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
}