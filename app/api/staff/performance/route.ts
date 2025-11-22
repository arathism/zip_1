import { connectDB } from '@/lib/db';
import Staff from '@/models/Staff';
import Complaint from '@/models/Complaint';

export async function GET(request: Request) {
  try {
    await connectDB();
    
    const url = new URL(request.url);
    const staffId = url.searchParams.get('staffId');

    if (!staffId) {
      return Response.json({ error: 'Staff ID required' }, { status: 400 });
    }

    const staff = await Staff.findById(staffId);
    if (!staff) {
      return Response.json({ error: 'Staff not found' }, { status: 404 });
    }

    const complaints = await Complaint.find({ assignedTo: staffId });
    
    const totalAssigned = complaints.length;
    const totalResolved = complaints.filter((c: any) => c.status === 'resolved').length;
    const totalEscalated = complaints.filter((c: any) => c.escalationLevel > 0).length;
    const resolutionRate = totalAssigned > 0 ? Math.round((totalResolved / totalAssigned) * 100) : 0;

    const resolvedComplaints = complaints.filter((c: any) => c.status === 'resolved');
    const totalResolutionTime = resolvedComplaints.reduce((total: number, complaint: any) => {
      const resolutionTime = new Date(complaint.updatedAt).getTime() - new Date(complaint.createdAt).getTime();
      return total + resolutionTime;
    }, 0);
    
    const averageResolutionTime = resolvedComplaints.length > 0 
      ? Math.round(totalResolutionTime / resolvedComplaints.length / (1000 * 60 * 60 * 24))
      : 0;

    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthComplaints = complaints.filter((complaint: any) => 
        new Date(complaint.createdAt) >= monthStart && new Date(complaint.createdAt) <= monthEnd
      );

      monthlyStats.push({
        month,
        assigned: monthComplaints.length,
        resolved: monthComplaints.filter((c: any) => c.status === 'resolved').length,
        escalated: monthComplaints.filter((c: any) => c.escalationLevel > 0).length
      });
    }

    const stats = {
      totalAssigned,
      totalResolved,
      totalEscalated,
      resolutionRate,
      averageResolutionTime,
      performanceScore: staff.performanceScore,
      monthlyStats
    };

    return Response.json({ stats }, { status: 200 });

  } catch (error: any) {
    console.error('Performance stats error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}