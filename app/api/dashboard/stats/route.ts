// app/api/dashboard/stats/route.ts
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Complaint from '@/models/Complaint';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    await connectDB();
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    let stats = {};

    if (user.role === 'student') {
      const totalComplaints = await Complaint.countDocuments({ submittedBy: user._id });
      const pendingComplaints = await Complaint.countDocuments({ 
        submittedBy: user._id, 
        status: { $in: ['pending', 'in-progress'] } 
      });
      const resolvedComplaints = await Complaint.countDocuments({ 
        submittedBy: user._id, 
        status: 'resolved' 
      });

      stats = { totalComplaints, pendingComplaints, resolvedComplaints };
    } else if (user.role === 'staff') {
      const assignedComplaints = await Complaint.countDocuments({ 
        assignedTo: user._id,
        status: { $in: ['assigned', 'in-progress'] }
      });
      const resolvedThisMonth = await Complaint.countDocuments({
        assignedTo: user._id,
        status: 'resolved',
        updatedAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      });

      stats = { assignedComplaints, resolvedThisMonth, avgResolutionTime: 2 };
    } else if (user.role === 'admin') {
      const totalUsers = await User.countDocuments({ isActive: true });
      const activeComplaints = await Complaint.countDocuments({ 
        status: { $in: ['pending', 'assigned', 'in-progress'] } 
      });
      const resolvedComplaints = await Complaint.countDocuments({ 
        status: 'resolved' 
      });

      stats = { totalUsers, activeComplaints, resolvedComplaints };
    }

    return Response.json({ stats }, { status: 200 });

  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return Response.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}