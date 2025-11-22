const twilio = require('twilio');

// Professional SMS Message Templates
const SMS_TEMPLATES = {
  // Registration & Welcome Messages
  studentWelcome: (name: string, url: string) => 
    `Welcome to SolveIT Complaint Management System. Your student account has been activated. Access portal: ${url}/student`,
  
  staffWelcome: (name: string, url: string) => 
    `Welcome to SolveIT Staff Portal. Your account is ready for complaint management. Login: ${url}/staff`,
  
  adminWelcome: (name: string, url: string) => 
    `SolveIT Administrator account activated. System management access: ${url}/admin`,
  
  // Complaint Assignment & Management
  complaintAssignment: (staffName: string, title: string, id: string, dueDate: string, url: string) =>
    `You have been assigned a new complaint: "${title}" (Reference: ${id}). Due date: ${dueDate}. Access: ${url}/staff`,
  
  priorityAssignment: (title: string, id: string) =>
    `URGENT: High-priority complaint "${title}" (${id}) assigned to you. Immediate attention required.`,
  
  // Status Update Notifications
  inProgress: (id: string, title: string) =>
    `Complaint ${id} status: IN PROGRESS. "${title}" is currently being addressed.`,
  
  resolved: (id: string, title: string) =>
    `COMPLAINT RESOLVED: "${title}" (${id}) has been successfully resolved. Thank you.`,
  
  escalated: (id: string, title: string) =>
    `ESCALATION NOTICE: Complaint ${id} has been escalated for senior review. "${title}"`,
  
  // Reminder & Follow-up Messages
  dueReminder: (id: string, title: string) =>
    `REMINDER: Complaint ${id} is due for resolution tomorrow. "${title}"`,
  
  followUp: (id: string) =>
    `ACTION REQUIRED: Complaint ${id} needs your update. Please provide current status.`,
  
  // System & Security Messages
  passwordReset: (token: string) =>
    `SolveIT Security: Your password reset code is ${token}. This code expires in 10 minutes.`,
  
  // Priority Level Messages
  critical: (id: string, title: string) =>
    `CRITICAL: Complaint ${id} requires immediate action. "${title}" - Highest priority.`,
  
  highPriority: (id: string, title: string) =>
    `HIGH PRIORITY: Complaint ${id} assigned. "${title}" - Please address urgently.`,
  
  standard: (id: string, title: string) =>
    `New complaint ${id} assigned: "${title}". Standard processing timeline applies.`,
  
  // Resolution & Closure
  studentResolution: (title: string, id: string) =>
    `Your complaint "${title}" (${id}) has been resolved. Thank you for using SolveIT.`,
  
  staffCompletion: (id: string, title: string) =>
    `Complaint ${id} marked as resolved. "${title}" - Case closed successfully.`
};

// Overloaded function signatures
export async function sendWelcomeSMS(phoneNumber: string, name: string, role: string): Promise<any>;
export async function sendWelcomeSMS(phoneNumber: string, message: string): Promise<any>;
export async function sendWelcomeSMS(phoneNumber: string, arg2: string, arg3?: string): Promise<any> {
  try {
    // If only 2 arguments, treat second as message
    const message = arg3 ? `Welcome ${arg2}! Your ${arg3} account has been created in SolveIT College Complaint System. Login: ${process.env.NEXTAUTH_URL}` : arg2;

    if (process.env.SMS_DEV_MODE === 'true') {
      console.log(`[DEV] SMS would be sent to: ${phoneNumber}`);
      console.log(`[DEV] Message: ${message}`);
      return { success: true, mode: 'dev' };
    }

    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      console.error('❌ Twilio configuration missing');
      return { success: false, error: 'Twilio configuration missing' };
    }

    const cleanedPhone = phoneNumber.replace(/\D/g, '');
    console.log('📞 Phone processing - Original:', phoneNumber, 'Cleaned:', cleanedPhone);

    if (cleanedPhone.length < 10) {
      console.error('❌ Invalid phone number length:', cleanedPhone);
      return { success: false, error: 'Invalid phone number length' };
    }

    let formattedPhone;
    
    if (cleanedPhone.length === 10) {
      formattedPhone = '+91' + cleanedPhone;
    } else if (cleanedPhone.length === 12 && cleanedPhone.startsWith('91')) {
      formattedPhone = '+' + cleanedPhone;
    } else if (cleanedPhone.length > 10) {
      formattedPhone = '+' + cleanedPhone;
    } else {
      formattedPhone = '+91' + cleanedPhone.slice(-10);
    }

    console.log('📞 Formatted phone for Twilio:', formattedPhone);

    if (!formattedPhone.match(/^\+\d{10,15}$/)) {
      console.error('❌ Invalid phone number format after formatting:', formattedPhone);
      return { success: false, error: 'Invalid phone number format' };
    }

    if (process.env.NODE_ENV === 'development' && process.env.TEST_PHONE_1) {
      console.log('🔧 Development mode: Using test phone number');
      formattedPhone = process.env.TEST_PHONE_1;
    }

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    console.log('📤 Attempting to send SMS via Twilio...');
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    console.log(`✅ SMS sent successfully to ${formattedPhone}: ${result.sid}`);
    return { success: true, messageId: result.sid };
    
  } catch (error: any) {
    console.error('❌ Twilio SMS Error:', {
      code: error.code,
      message: error.message,
      moreInfo: error.moreInfo
    });
    
    return { success: false, error: error.message, code: error.code };
  }
}

export async function sendComplaintAssignmentSMS(
  phoneNumber: string,
  staffName: string,
  complaintTitle: string,
  complaintId: string,
  dueDate: Date
) {
  try {
    if (process.env.SMS_DEV_MODE === 'true') {
      console.log(`[DEV] Complaint assignment SMS would be sent to: ${phoneNumber}`);
      return { success: true, mode: 'dev' };
    }

    // Using professional template
    const message = SMS_TEMPLATES.complaintAssignment(
      staffName,
      complaintTitle,
      complaintId,
      dueDate.toLocaleDateString(),
      process.env.NEXTAUTH_URL || 'http://localhost:3000'
    );
    
    // Use the overloaded function with message only
    return await sendWelcomeSMS(phoneNumber, message);
  } catch (error: any) {
    console.error('Error sending complaint assignment SMS:', error);
    return { success: false, error: error.message };
  }
}

export async function sendEscalationSMS(
  phoneNumber: string,
  staffName: string,
  complaintTitle: string,
  complaintId: string
) {
  try {
    if (process.env.SMS_DEV_MODE === 'true') {
      console.log(`[DEV] Escalation SMS would be sent to: ${phoneNumber}`);
      return { success: true, mode: 'dev' };
    }

    // Using professional template
    const message = SMS_TEMPLATES.critical(complaintId, complaintTitle);
    
    return await sendWelcomeSMS(phoneNumber, message);
  } catch (error: any) {
    console.error('Error sending escalation SMS:', error);
    return { success: false, error: error.message };
  }
}

// New function for professional registration SMS
export async function sendProfessionalRegistrationSMS(
  phoneNumber: string,
  name: string,
  role: string
) {
  try {
    const url = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    let message;

    switch (role.toLowerCase()) {
      case 'student':
        message = SMS_TEMPLATES.studentWelcome(name, url);
        break;
      case 'staff':
      case 'faculty':
      case 'warden':
        message = SMS_TEMPLATES.staffWelcome(name, url);
        break;
      case 'admin':
        message = SMS_TEMPLATES.adminWelcome(name, url);
        break;
      default:
        message = `Welcome ${name}! Your ${role} account has been created in SolveIT College Complaint System. Login: ${url}`;
    }

    if (process.env.SMS_DEV_MODE === 'true') {
      console.log(`[DEV] Professional registration SMS would be sent to: ${phoneNumber}`);
      console.log(`[DEV] Message: ${message}`);
      return { success: true, mode: 'dev' };
    }

    return await sendWelcomeSMS(phoneNumber, message);
  } catch (error: any) {
    console.error('Error sending professional registration SMS:', error);
    return { success: false, error: error.message };
  }
}

// New function for complaint status updates
export async function sendProfessionalStatusUpdateSMS(
  phoneNumber: string,
  studentName: string,
  complaintTitle: string,
  complaintId: string,
  status: string
) {
  try {
    let message;

    switch (status.toLowerCase()) {
      case 'in progress':
        message = SMS_TEMPLATES.inProgress(complaintId, complaintTitle);
        break;
      case 'resolved':
        message = SMS_TEMPLATES.studentResolution(complaintTitle, complaintId);
        break;
      case 'escalated':
        message = SMS_TEMPLATES.escalated(complaintId, complaintTitle);
        break;
      default:
        message = `Complaint ${complaintId} status updated to: ${status}. "${complaintTitle}"`;
    }

    if (process.env.SMS_DEV_MODE === 'true') {
      console.log(`[DEV] Professional status update SMS would be sent to: ${phoneNumber}`);
      console.log(`[DEV] Message: ${message}`);
      return { success: true, mode: 'dev' };
    }

    return await sendWelcomeSMS(phoneNumber, message);
  } catch (error: any) {
    console.error('Error sending professional status update SMS:', error);
    return { success: false, error: error.message };
  }
}

// New function for reminder messages
export async function sendReminderSMS(
  phoneNumber: string,
  complaintId: string,
  complaintTitle: string,
  type: 'due' | 'followup' = 'due'
) {
  try {
    const message = type === 'due' 
      ? SMS_TEMPLATES.dueReminder(complaintId, complaintTitle)
      : SMS_TEMPLATES.followUp(complaintId);

    if (process.env.SMS_DEV_MODE === 'true') {
      console.log(`[DEV] Reminder SMS would be sent to: ${phoneNumber}`);
      console.log(`[DEV] Message: ${message}`);
      return { success: true, mode: 'dev' };
    }

    return await sendWelcomeSMS(phoneNumber, message);
  } catch (error: any) {
    console.error('Error sending reminder SMS:', error);
    return { success: false, error: error.message };
  }
}

// New function for password reset
export async function sendProfessionalPasswordResetSMS(
  phoneNumber: string,
  resetToken: string
) {
  try {
    const message = SMS_TEMPLATES.passwordReset(resetToken);

    if (process.env.SMS_DEV_MODE === 'true') {
      console.log(`[DEV] Professional password reset SMS would be sent to: ${phoneNumber}`);
      console.log(`[DEV] Message: ${message}`);
      return { success: true, mode: 'dev' };
    }

    return await sendWelcomeSMS(phoneNumber, message);
  } catch (error: any) {
    console.error('Error sending professional password reset SMS:', error);
    return { success: false, error: error.message };
  }
}

export async function sendComplaintUpdateSMS(
  studentPhone: string,
  studentName: string,
  complaintTitle: string,
  complaintId: string,
  updateMessage: string
) {
  // Add your SMS sending logic here
  console.log('Sending complaint update SMS to:', studentPhone);
  return { success: true };
}

export async function testTwilioConnection(): Promise<{ success: boolean; error?: string; account?: string; status?: string }> {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      return { success: false, error: 'Twilio credentials missing' };
    }

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    console.log('✅ Twilio connection successful. Account:', account.friendlyName);
    return { 
      success: true, 
      account: account.friendlyName,
      status: account.status
    };
  } catch (error: any) {
    console.error('❌ Twilio connection test failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Export the templates for external use
export { SMS_TEMPLATES };