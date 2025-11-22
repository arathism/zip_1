import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Staff from '@/models/Staff';

export async function GET() {
  try {
    await connectDB();
    
    const staff = await Staff.find({}).select('-password').lean();
    
    return NextResponse.json({
      success: true,
      data: staff
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch staff data' 
      },
      { status: 500 }
    );
  }
}