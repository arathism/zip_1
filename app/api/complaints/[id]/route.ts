import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const complaintId = params.id;
    
    // In a real application, you would fetch from your database
    // For now, we'll return a mock response or try to get from localStorage
    
    const mockComplaint = {
      id: complaintId,
      title: 'Library AC not working',
      status: 'escalated',
      priority: 'high',
      createdAt: new Date().toISOString(),
      studentName: 'Alice Johnson',
      studentEmail: 'alice.johnson@college.edu',
      studentPhone: '+91-9876543210',
      overdue: false,
      category: 'library',
      description: 'The air conditioning in the library reading room is not functioning properly.',
      studentCollegeId: 'COL2024001',
      assignedStaffName: 'Library Supervisor',
      escalatedFromStaff: 'Library Assistant',
      escalationReason: 'Requires budget approval for AC repair',
      originalStaffName: 'Library Assistant',
      escalationLevel: 'senior',
      escalatedToStaff: 'Library Supervisor',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'student'
    };

    return NextResponse.json(mockComplaint);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch complaint details' },
      { status: 500 }
    );
  }
}