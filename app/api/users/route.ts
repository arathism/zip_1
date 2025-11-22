// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    let query = {};
    if (role) {
      query = { role: role, isActive: true };
    }

    const count = await User.countDocuments(query);

    return NextResponse.json({
      success: true,
      count: count,
      role: role || 'all'
    });

  } catch (error: any) {
    console.error('Error fetching user count:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user count' },
      { status: 500 }
    );
  }
}