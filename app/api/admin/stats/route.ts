// app/api/admin/stats/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock data - replace with actual database queries
    const stats = {
      totalComplaints: 163,
      pendingComplaints: 8,
      resolvedComplaints: 45,
      totalStudents: 245,
      totalStaff: 18
    };

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch stats',
        message: error.message 
      },
      { status: 500 }
    );
  }
}