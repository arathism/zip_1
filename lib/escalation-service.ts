import Complaint from '@/models/Complaint';
import Staff from '@/models/Staff';
import { sendEscalationEmail } from '@/lib/email';
import { sendEscalationSMS } from '@/lib/sms';

export async function checkComplaintEscalations() {
  try {
    const now = new Date();
    const overdueComplaints = await Complaint.find({
      status: { $in: ['assigned', 'in-progress'] },
      dueDate: { $lt: now },
      escalationLevel: { $lt: 3 }
    }).populate('assignedTo');

    for (const complaint of overdueComplaints) {
      await escalateComplaint(complaint);
    }

    console.log(`Checked ${overdueComplaints.length} complaints for escalation`);
  } catch (error) {
    console.error('Escalation check error:', error);
  }
}

async function escalateComplaint(complaint: any) {
  const escalationLevel = complaint.escalationLevel + 1;
  
  const higherAuthority = await findHigherAuthority(complaint.category, complaint.collegeId, escalationLevel);
  
  if (!higherAuthority) {
    console.log(`No higher authority found for escalation level ${escalationLevel}`);
    return;
  }

  const originalStaffId = complaint.assignedTo;

  complaint.assignedTo = higherAuthority._id;
  complaint.assignedToName = higherAuthority.name;
  complaint.assignedToEmail = higherAuthority.email;
  complaint.escalationLevel = escalationLevel;
  complaint.status = 'escalated';
  complaint.escalationReason = `Auto-escalated due to missing deadline (Level ${escalationLevel})`;
  complaint.updatedAt = new Date();

  await complaint.save();

  const originalStaff = await Staff.findById(originalStaffId);
  if (originalStaff) {
    originalStaff.escalatedComplaints += 1;
    await (originalStaff as any).updatePerformance(); // Type assertion for method
  }

  await Staff.findByIdAndUpdate(higherAuthority._id, {
    $inc: { assignedComplaints: 1 }
  });

  await sendEscalationNotifications(complaint, higherAuthority, originalStaff);

  console.log(`Complaint ${complaint._id} escalated to ${higherAuthority.name}`);
}

async function findHigherAuthority(category: string, collegeId: string, escalationLevel: number) {
  const rolesByLevel = {
    1: 'Supervisor',
    2: 'Manager', 
    3: 'Director'
  };

  const role = rolesByLevel[escalationLevel as keyof typeof rolesByLevel];
  
  if (!role) return null;

  return await Staff.findOne({
    department: category,
    collegeId: collegeId,
    role: role,
    isActive: true
  }).sort({ assignedComplaints: 1 });
}

async function sendEscalationNotifications(complaint: any, newStaff: any, originalStaff: any) {
  try {
    await sendEscalationEmail(
      newStaff.email,
      newStaff.name,
      complaint.title,
      complaint._id.toString(),
      complaint.dueDate,
      complaint.escalationLevel,
      originalStaff.name
    );

    await sendEscalationEmail(
      originalStaff.email,
      originalStaff.name,
      complaint.title,
      complaint._id.toString(),
      complaint.dueDate,
      complaint.escalationLevel,
      'You',
      true
    );

    console.log(`Escalation: Complaint ${complaint._id} moved from ${originalStaff.name} to ${newStaff.name}`);

  } catch (error) {
    console.error('Escalation notification error:', error);
  }
}

export function startEscalationService() {
  setInterval(checkComplaintEscalations, 60 * 60 * 1000);
  console.log('Escalation service started');
}