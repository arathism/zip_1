// app/api/staff/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();
    
    const staff = await User.find({ 
      role: 'staff',
      isActive: true 
    }).select('name email department category isActive currentWorkload performanceScore');

    return NextResponse.json({
      success: true,
      data: staff
    });

  } catch (error: any) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}