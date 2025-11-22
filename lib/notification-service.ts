// Mock email service
export const sendEmailNotification = async (to: string, subject: string, message: string): Promise<boolean> => {
  try {
    console.log(`📧 Sending email to: ${to}`);
    console.log(`📧 Subject: ${subject}`);
    console.log(`📧 Message: ${message}`);
    
    // In a real application, you would integrate with:
    // - SendGrid, AWS SES, Nodemailer, etc.
    // For demo purposes, we'll simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate successful email sending
    console.log('✅ Email sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
  }
};

// Mock SMS service
export const sendSMSNotification = async (phoneNumber: string, message: string): Promise<boolean> => {
  try {
    console.log(`📱 Sending SMS to: ${phoneNumber}`);
    console.log(`📱 Message: ${message}`);
    
    // In a real application, you would integrate with:
    // - Twilio, AWS SNS, Plivo, etc.
    // For demo purposes, we'll simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate successful SMS sending
    console.log('✅ SMS sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to send SMS:', error);
    return false;
  }
};

// Student database (in real app, this would be from your database)
export const studentDatabase: Record<string, { email: string; phone?: string; name: string }> = {
  "demo-student-id": {
    email: "demo@student.edu",
    phone: "+1234567890",
    name: "Demo Student"
  },
  "student-001": {
    email: "john.doe@student.edu",
    phone: "+1234567891",
    name: "John Doe"
  },
  "student-002": {
    email: "jane.smith@student.edu",
    phone: "+1234567892",
    name: "Jane Smith"
  }
};

// Notification templates
export const notificationTemplates = {
  complaintResolved: {
    email: {
      subject: "🎉 Your Complaint Has Been Resolved!",
      body: (studentName: string, complaintId: string, complaintTitle: string, resolvedBy: string) => `
Dear ${studentName},

We're pleased to inform you that your complaint has been successfully resolved!

Complaint Details:
• ID: ${complaintId}
• Title: ${complaintTitle}
• Resolved by: ${resolvedBy}
• Resolution Date: ${new Date().toLocaleDateString()}

Thank you for bringing this matter to our attention. We hope this resolution meets your expectations.

Please take a moment to rate your satisfaction with the resolution process.

Best regards,
Complaint Management System
University Administration
      `.trim()
    },
    sms: {
      body: (complaintId: string, complaintTitle: string) => 
        `Your complaint ${complaintId} "${complaintTitle}" has been resolved! Check your email for details. - University CMS`
    }
  },
  complaintEscalated: {
    email: {
      subject: "⚡ Your Complaint Has Been Escalated",
      body: (studentName: string, complaintId: string, complaintTitle: string, newAssignee: string) => `
Dear ${studentName},

Your complaint has been escalated to ensure timely resolution.

Complaint Details:
• ID: ${complaintId}
• Title: ${complaintTitle}
• Now assigned to: ${newAssignee}

We apologize for the delay and assure you that this matter is receiving higher priority attention.

You will be notified once the issue is resolved.

Best regards,
Complaint Management System
University Administration
      `.trim()
    },
    sms: {
      body: (complaintId: string) => 
        `Your complaint ${complaintId} has been escalated for faster resolution. - University CMS`
    }
  },
  complaintAssigned: {
    email: {
      subject: "📋 Your Complaint Has Been Assigned",
      body: (studentName: string, complaintId: string, complaintTitle: string, assignedTo: string, dueDate: string) => `
Dear ${studentName},

Your complaint has been assigned to the appropriate staff member.

Complaint Details:
• ID: ${complaintId}
• Title: ${complaintTitle}
• Assigned to: ${assignedTo}
• Expected resolution: ${dueDate}

We will keep you updated on the progress. You can track the status through your student dashboard.

Best regards,
Complaint Management System
University Administration
      `.trim()
    },
    sms: {
      body: (complaintId: string, assignedTo: string) => 
        `Complaint ${complaintId} assigned to ${assignedTo}. Expected resolution soon. - University CMS`
    }
  }
};

// Main notification service
export class NotificationService {
  static async sendComplaintResolved(
    studentId: string, 
    complaintId: string, 
    complaintTitle: string, 
    resolvedBy: string
  ): Promise<{ emailSent: boolean; smsSent: boolean }> {
    const student = studentDatabase[studentId];
    if (!student) {
      console.error(`Student not found: ${studentId}`);
      return { emailSent: false, smsSent: false };
    }

    const template = notificationTemplates.complaintResolved;
    
    // Send email
    const emailSent = await sendEmailNotification(
      student.email,
      template.email.subject,
      template.email.body(student.name, complaintId, complaintTitle, resolvedBy)
    );

    // Send SMS if phone number exists
    let smsSent = false;
    if (student.phone) {
      smsSent = await sendSMSNotification(
        student.phone,
        template.sms.body(complaintId, complaintTitle)
      );
    }

    // Log notification activity
    this.logNotification({
      studentId,
      complaintId,
      type: 'RESOLVED',
      emailSent,
      smsSent,
      timestamp: new Date().toISOString()
    });

    return { emailSent, smsSent };
  }

  static async sendComplaintEscalated(
    studentId: string,
    complaintId: string,
    complaintTitle: string,
    newAssignee: string
  ): Promise<{ emailSent: boolean; smsSent: boolean }> {
    const student = studentDatabase[studentId];
    if (!student) {
      console.error(`Student not found: ${studentId}`);
      return { emailSent: false, smsSent: false };
    }

    const template = notificationTemplates.complaintEscalated;
    
    const emailSent = await sendEmailNotification(
      student.email,
      template.email.subject,
      template.email.body(student.name, complaintId, complaintTitle, newAssignee)
    );

    let smsSent = false;
    if (student.phone) {
      smsSent = await sendSMSNotification(
        student.phone,
        template.sms.body(complaintId)
      );
    }

    this.logNotification({
      studentId,
      complaintId,
      type: 'ESCALATED',
      emailSent,
      smsSent,
      timestamp: new Date().toISOString()
    });

    return { emailSent, smsSent };
  }

  static async sendComplaintAssigned(
    studentId: string,
    complaintId: string,
    complaintTitle: string,
    assignedTo: string,
    dueDate: string
  ): Promise<{ emailSent: boolean; smsSent: boolean }> {
    const student = studentDatabase[studentId];
    if (!student) {
      console.error(`Student not found: ${studentId}`);
      return { emailSent: false, smsSent: false };
    }

    const template = notificationTemplates.complaintAssigned;
    
    const emailSent = await sendEmailNotification(
      student.email,
      template.email.subject,
      template.email.body(student.name, complaintId, complaintTitle, assignedTo, dueDate)
    );

    let smsSent = false;
    if (student.phone) {
      smsSent = await sendSMSNotification(
        student.phone,
        template.sms.body(complaintId, assignedTo)
      );
    }

    this.logNotification({
      studentId,
      complaintId,
      type: 'ASSIGNED',
      emailSent,
      smsSent,
      timestamp: new Date().toISOString()
    });

    return { emailSent, smsSent };
  }

  private static logNotification(notification: {
    studentId: string;
    complaintId: string;
    type: string;
    emailSent: boolean;
    smsSent: boolean;
    timestamp: string;
  }) {
    const notifications = JSON.parse(localStorage.getItem('notificationLogs') || '[]');
    notifications.push(notification);
    localStorage.setItem('notificationLogs', JSON.stringify(notifications));
    
    console.log('📝 Notification logged:', notification);
  }

  static getNotificationLogs() {
    return JSON.parse(localStorage.getItem('notificationLogs') || '[]');
  }
}