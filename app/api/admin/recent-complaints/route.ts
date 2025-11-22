// app/api/admin/recent-complaints/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock data for recent complaints - replace with actual database queries
    const recentComplaints = [
      {
        id: 'COMP-2024-001',
        title: 'WiFi connectivity issue in Library',
        status: 'in progress',
        createdAt: new Date('2024-01-15').toISOString()
      },
      {
        id: 'COMP-2024-002',
        title: 'Air conditioning not working in Block A',
        status: 'pending',
        createdAt: new Date('2024-01-14').toISOString()
      },
      {
        id: 'COMP-2024-003',
        title: 'Projector malfunction in Room 301',
        status: 'resolved',
        createdAt: new Date('2024-01-13').toISOString()
      },
      {
        id: 'COMP-2024-004',
        title: 'Water leakage in Chemistry Lab',
        status: 'in progress',
        createdAt: new Date('2024-01-12').toISOString()
      },
      {
        id: 'COMP-2024-005',
        title: 'Broken furniture in Seminar Hall',
        status: 'pending',
        createdAt: new Date('2024-01-11').toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      data: recentComplaints
    });
  } catch (error: any) {
    console.error('Recent complaints API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch recent complaints',
        message: error.message 
      },
      { status: 500 }
    );
  }
}