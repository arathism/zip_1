import { connectDB } from '@/lib/db';
import Staff from '@/models/Staff';

export async function GET(request: Request) {
  try {
    await connectDB();
    
    const url = new URL(request.url);
    const collegeId = url.searchParams.get('collegeId') || 'COL001';

    const staffByDepartment = await Staff.aggregate([
      { 
        $match: { 
          collegeId: collegeId,
          isActive: true 
        } 
      },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          staff: {
            $push: {
              name: '$name',
              role: '$role',
              assignedComplaints: '$assignedComplaints',
              performanceScore: '$performanceScore'
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const totalStaff = await Staff.countDocuments({ 
      collegeId: collegeId, 
      isActive: true 
    });

    return Response.json({ 
      totalStaff,
      departments: staffByDepartment,
      summary: {
        availableCategories: staffByDepartment.map(dept => dept._id),
        totalDepartments: staffByDepartment.length
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Staff availability check error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}