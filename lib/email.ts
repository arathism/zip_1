import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.log('❌ Email transporter error:', error);
  } else {
    console.log('✅ Email server is ready to take messages');
  }
});

// Export all email functions
export async function sendWelcomeEmail(email: string, name: string, role: string, collegeId: string) {
  try {
    if (process.env.EMAIL_DEV_MODE === 'true') {
      console.log(`[DEV] Welcome email would be sent to: ${email}`);
      return { success: true, mode: 'dev' };
    }

    const mailOptions = {
      from: `"SolveIT System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to SolveIT - College Complaint Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0; color: white;">
            <h1 style="margin: 0; font-size: 24px;">SolveIT</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">College Complaint Management System</p>
          </div>
          
          <div style="padding: 20px;">
            <h2 style="color: #333; margin-bottom: 10px;">Welcome to SolveIT, ${name}!</h2>
            
            <p>Your account has been successfully created with the following details:</p>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>College ID:</strong> ${collegeId}</p>
              <p><strong>Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}</p>
              <p><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p>You can now login to the SolveIT system and:</p>
            <ul>
              ${role === 'student' ? 
                '<li>Report new complaints and issues</li><li>Track your complaint status</li><li>Communicate with authorities</li>' : 
                role === 'staff' ?
                '<li>Manage assigned complaints</li><li>Update complaint status</li><li>Communicate with students</li>' :
                '<li>Manage all complaints</li><li>Track system statistics</li><li>Manage users and departments</li>'
              }
            </ul>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="${process.env.NEXTAUTH_URL}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Login to SolveIT
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; border-top: 1px solid #e0e0e0; padding-top: 15px;">
              If you have any questions, please contact the system administrator.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Error sending welcome email:', error.message);
    return { success: false, error: error.message };
  }
}

export async function sendRegistrationNotification(email: string, name: string, role: string, collegeId: string, department: string) {
  try {
    if (process.env.EMAIL_DEV_MODE === 'true') {
      console.log(`[DEV] Registration notification would be sent for: ${email}`);
      return { success: true, mode: 'dev' };
    }

    const mailOptions = {
      from: `"SolveIT System" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: 'New User Registration - SolveIT',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">New User Registration</h2>
          <p>A new user has registered in SolveIT system:</p>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>College ID:</strong> ${collegeId}</p>
            <p><strong>Department:</strong> ${department}</p>
            <p><strong>Role:</strong> ${role}</p>
            <p><strong>Registration Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Registration notification sent for ${email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Error sending registration notification:', error.message);
    return { success: false, error: error.message };
  }
}

export async function sendComplaintAssignmentEmail(
  staffEmail: string, 
  staffName: string, 
  complaintTitle: string, 
  complaintId: string, 
  dueDate: Date,
  priority: string
) {
  try {
    if (process.env.EMAIL_DEV_MODE === 'true') {
      console.log(`[DEV] Complaint assignment email would be sent to: ${staffEmail}`);
      return { success: true, mode: 'dev' };
    }

    const mailOptions = {
      from: `"SolveIT System" <${process.env.EMAIL_USER}>`,
      to: staffEmail,
      subject: `New Complaint Assigned - ${complaintId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">New Complaint Assigned</h2>
          <p>Dear ${staffName},</p>
          <p>A new complaint has been assigned to you:</p>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Complaint ID:</strong> ${complaintId}</p>
            <p><strong>Title:</strong> ${complaintTitle}</p>
            <p><strong>Priority:</strong> ${priority.toUpperCase()}</p>
            <p><strong>Due Date:</strong> ${dueDate.toLocaleDateString()}</p>
          </div>
          
          <p>Please resolve this complaint before the due date to maintain your performance score.</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.NEXTAUTH_URL}/staff/complaints/${complaintId}" 
               style="background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
              View Complaint
            </a>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Complaint assignment email sent to ${staffEmail}`);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error sending complaint assignment email:', error.message);
    return { success: false, error: error.message };
  }
}

export async function sendComplaintConfirmationEmail(
  studentEmail: string,
  studentName: string,
  complaintTitle: string,
  complaintId: string,
  staffName: string,
  dueDate: Date
) {
  try {
    if (process.env.EMAIL_DEV_MODE === 'true') {
      console.log(`[DEV] Complaint confirmation email would be sent to: ${studentEmail}`);
      return { success: true, mode: 'dev' };
    }

    const mailOptions = {
      from: `"SolveIT System" <${process.env.EMAIL_USER}>`,
      to: studentEmail,
      subject: `Complaint Submitted - ${complaintId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Complaint Submitted Successfully</h2>
          <p>Dear ${studentName},</p>
          <p>Your complaint has been submitted and assigned for resolution:</p>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Complaint ID:</strong> ${complaintId}</p>
            <p><strong>Title:</strong> ${complaintTitle}</p>
            <p><strong>Assigned To:</strong> ${staffName}</p>
            <p><strong>Expected Resolution:</strong> ${dueDate.toLocaleDateString()}</p>
          </div>
          
          <p>You can track the progress of your complaint in your dashboard.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Complaint confirmation email sent to ${studentEmail}`);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error sending complaint confirmation email:', error.message);
    return { success: false, error: error.message };
  }
}

export async function sendEscalationEmail(
  staffEmail: string,
  staffName: string,
  complaintTitle: string,
  complaintId: string,
  dueDate: Date,
  escalationLevel: number,
  previousStaff: string,
  isOriginalStaff: boolean = false
) {
  try {
    if (process.env.EMAIL_DEV_MODE === 'true') {
      console.log(`[DEV] Escalation email would be sent to: ${staffEmail}`);
      return { success: true, mode: 'dev' };
    }

    const subject = isOriginalStaff 
      ? `Complaint Escalated - ${complaintId}`
      : `Escalated Complaint Assigned - ${complaintId}`;

    const message = isOriginalStaff
      ? `Your complaint has been escalated to a higher authority due to missing the resolution deadline.`
      : `A complaint has been escalated to you from ${previousStaff} due to missing the resolution deadline.`;

    const mailOptions = {
      from: `"SolveIT System" <${process.env.EMAIL_USER}>`,
      to: staffEmail,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #DC2626;">Complaint Escalation</h2>
          <p>Dear ${staffName},</p>
          <p>${message}</p>
          
          <div style="background: #fef2f2; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Complaint ID:</strong> ${complaintId}</p>
            <p><strong>Title:</strong> ${complaintTitle}</p>
            <p><strong>Original Due Date:</strong> ${dueDate.toLocaleDateString()}</p>
            <p><strong>Escalation Level:</strong> ${escalationLevel}</p>
            <p><strong>Previous Assignee:</strong> ${previousStaff}</p>
          </div>
          
          <p style="color: #DC2626;">
            <strong>Note:</strong> This escalation may affect performance scores.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Escalation email sent to ${staffEmail}`);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error sending escalation email:', error.message);
    return { success: false, error: error.message };
  }
}

export async function sendComplaintUpdateEmail(
  studentEmail: string,
  studentName: string,
  complaintTitle: string,
  complaintId: string,
  updateMessage: string,
  currentStatus: string,
  assignedStaff: string
) {
  try {
    if (process.env.EMAIL_DEV_MODE === 'true') {
      console.log(`[DEV] Complaint update email would be sent to: ${studentEmail}`);
      return { success: true, mode: 'dev' };
    }

    const statusColors: { [key: string]: string } = {
      'in-progress': '#2563eb',
      'resolved': '#16a34a', 
      'escalated': '#dc2626',
      'assigned': '#d97706',
      'pending': '#6b7280'
    };

    const statusText: { [key: string]: string } = {
      'in-progress': 'In Progress',
      'resolved': 'Resolved',
      'escalated': 'Escalated',
      'assigned': 'Assigned',
      'pending': 'Pending'
    };

    const mailOptions = {
      from: `"SolveIT System" <${process.env.EMAIL_USER}>`,
      to: studentEmail,
      subject: `Complaint Status Update - ${complaintTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0; color: white;">
            <h1 style="margin: 0; font-size: 24px;">SolveIT</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">College Complaint Management System</p>
          </div>
          
          <div style="padding: 20px;">
            <h2 style="color: #333; margin-bottom: 10px;">Complaint Status Update</h2>
            
            <p>Dear <strong>${studentName}</strong>,</p>
            
            <p>The status of your complaint has been updated:</p>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Complaint ID:</strong> ${complaintId}</p>
              <p><strong>Title:</strong> ${complaintTitle}</p>
              <p><strong>Current Status:</strong> 
                <span style="color: ${statusColors[currentStatus] || '#6b7280'}; font-weight: bold;">
                  ${statusText[currentStatus] || currentStatus}
                </span>
              </p>
              <p><strong>Assigned Staff:</strong> ${assignedStaff}</p>
              <p><strong>Update Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="background: #e8f4fd; padding: 15px; border-radius: 5px; border-left: 4px solid #2563eb;">
              <p style="margin: 0; color: #1e40af;"><strong>Update Message:</strong></p>
              <p style="margin: 10px 0 0 0; white-space: pre-line;">${updateMessage}</p>
            </div>
            
            <p>You can track the progress of your complaint in your dashboard.</p>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="${process.env.NEXTAUTH_URL}/student/dashboard" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Your Dashboard
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; border-top: 1px solid #e0e0e0; padding-top: 15px;">
              If you have any questions, please contact the assigned staff member or system administrator.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Complaint update email sent to ${studentEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Error sending complaint update email:', error.message);
    return { success: false, error: error.message };
  }
}