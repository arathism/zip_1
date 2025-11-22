// app/api/test-db/route.ts
import { connectDB } from '@/lib/db';
import Complaint from '@/models/Complaint';

export async function GET() {
  try {
    await connectDB();
    const count = await Complaint.countDocuments();
    const sample = await Complaint.findOne().lean();
    
    return Response.json({
      database: 'Connected',
      complaintCount: count,
      sampleComplaint: sample,
      collections: ['Working']
    });
  } catch (error: any) {
    return Response.json({
      error: 'Database test failed',
      message: error.message
    }, { status: 500 });
  }
}