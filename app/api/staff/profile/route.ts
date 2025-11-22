import { connectDB } from '@/lib/db';
import Staff from '@/models/Staff';

export async function PUT(request: Request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { staffId, name, phone } = body;

    if (!staffId) {
      return Response.json({ error: 'Staff ID required' }, { status: 400 });
    }

    const updatedStaff = await Staff.findByIdAndUpdate(
      staffId,
      { 
        name,
        phone,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-__v -password');

    if (!updatedStaff) {
      return Response.json({ error: 'Staff not found' }, { status: 404 });
    }

    return Response.json({ 
      message: 'Profile updated successfully',
      staff: updatedStaff
    }, { status: 200 });

  } catch (error: any) {
    console.error('Profile update error:', error);
    return Response.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}