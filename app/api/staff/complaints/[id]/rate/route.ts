// app/api/complaints/[id]/rate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Complaint from '@/models/Complaint';
import Staff from '@/models/Staff';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const complaintId = params.id;
    const { rating, comment, studentId } = await request.json();

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return NextResponse.json(
        { success: false, error: 'Complaint not found' },
        { status: 404 }
      );
    }

    // Add rating to complaint
    complaint.rating = {
      score: rating,
      comment: comment,
      ratedAt: new Date(),
      studentId: studentId
    };

    await complaint.save();

    // Update staff performance score
    if (complaint.assignedStaffId) {
      const staff = await Staff.findById(complaint.assignedStaffId);
      if (staff) {
        // Calculate new performance score (average of all ratings)
        const staffComplaints = await Complaint.find({
          assignedStaffId: staff._id,
          'rating.score': { $exists: true }
        });
        
        const totalRating = staffComplaints.reduce((sum, comp) => sum + (comp.rating?.score || 0), 0) + rating;
        const avgRating = totalRating / (staffComplaints.length + 1);
        
        staff.performanceScore = Math.round(avgRating * 20); // Convert to percentage
        await staff.save();
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Rating submitted successfully'
    });

  } catch (error: any) {
    console.error('Error submitting rating:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit rating' },
      { status: 500 }
    );
  }
}