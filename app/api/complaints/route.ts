import { connectDB } from '@/lib/db';
import Complaint from '@/models/Complaint';
import User from '@/models/User';
import { sendComplaintConfirmationEmail } from '@/lib/email';
import { sendComplaintAssignmentSMS } from '@/lib/sms';
import mongoose from 'mongoose';

// Handle OPTIONS request for CORS
export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// GET all complaints
export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const studentCollegeId = searchParams.get('studentCollegeId');
    const status = searchParams.get('status');
    
    let filter: any = {};
    
    // Filter by student if studentCollegeId is provided
    if (studentCollegeId) {
      filter.studentCollegeId = studentCollegeId;
    }
    
    // Filter by status if provided
    if (status) {
      filter.status = status;
    }
    
    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .lean();
    
    return Response.json({
      success: true,
      data: complaints
    });
    
  } catch (error: any) {
    console.error('Get complaints error:', error);
    return Response.json({ 
      success: false,
      error: 'Failed to fetch complaints',
      message: error.message 
    }, { status: 500 });
  }
}

// POST new complaint
export async function POST(request: Request) {
  try {
    await connectDB();
    
    const body = await request.json();
    console.log('📦 Complaint submission received:', body);

    // Extract fields with better error handling and mapping
    const {
      title,
      description,
      category,
      priority,
      studentName,
      studentCollegeId,
      studentEmail,
      studentPhone,
      department,
      location,
      assignedTo,
      dueDate: frontendDueDate,
      submittedBy // This should be the user's MongoDB ObjectId
    } = body;

    // Validate required fields
    const missingFields: string[] = [];
    if (!title) missingFields.push('title');
    if (!description) missingFields.push('description');
    if (!category) missingFields.push('category');
    if (!priority) missingFields.push('priority');
    if (!studentName) missingFields.push('studentName');
    if (!studentCollegeId) missingFields.push('studentCollegeId');
    if (!studentEmail) missingFields.push('studentEmail');
    if (!submittedBy) missingFields.push('submittedBy'); // This is the ObjectId

    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
      return Response.json({ 
        success: false,
        error: 'Missing required fields',
        missingFields: missingFields,
        message: `Please provide: ${missingFields.join(', ')}`
      }, { status: 400 });
    }

    // Validate that submittedBy is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(submittedBy)) {
      console.error('❌ Invalid studentId (ObjectId):', submittedBy);
      return Response.json({ 
        success: false,
        error: 'Invalid student ID format',
        message: 'Student ID must be a valid MongoDB ObjectId'
      }, { status: 400 });
    }

    // Calculate due date based on priority (use frontend provided date or calculate)
    let dueDate: Date;
    
    if (frontendDueDate) {
      dueDate = new Date(frontendDueDate);
      console.log('📅 Using frontend provided due date:', dueDate);
    } else {
      dueDate = new Date();
      switch (priority) {
        case 'urgent':
          dueDate.setDate(dueDate.getDate() + 1);
          break;
        case 'high':
          dueDate.setDate(dueDate.getDate() + 2);
          break;
        case 'medium':
          dueDate.setDate(dueDate.getDate() + 5);
          break;
        case 'low':
          dueDate.setDate(dueDate.getDate() + 10);
          break;
        default:
          dueDate.setDate(dueDate.getDate() + 7);
      }
      console.log('📅 Calculated due date based on priority:', dueDate);
    }

    // Create complaint data according to your schema
    const complaintData = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      priority: priority,
      studentId: new mongoose.Types.ObjectId(submittedBy), // Convert to ObjectId
      studentName: studentName.trim(),
      studentCollegeId: studentCollegeId.trim(),
      studentEmail: studentEmail.trim(),
      studentPhone: studentPhone?.trim() || undefined,
      assignedStaffName: assignedTo || 'Pending Assignment', // Use assignedStaffName instead of assignedTo
      department: department?.trim() || location?.trim() || undefined,
      dueDate: dueDate,
      status: 'pending'
    };

    console.log('📝 Creating complaint with schema-compliant data:', complaintData);

    // Create and save complaint
    const newComplaint = new Complaint(complaintData);
    await newComplaint.save();
    console.log('✅ Complaint saved to database with ID:', newComplaint._id);

    // Send confirmation email to student
    try {
      await sendComplaintConfirmationEmail(
        studentEmail,
        studentName,
        title,
        newComplaint._id.toString(),
        assignedTo || 'System Admin',
        dueDate
      );
      console.log('✅ Confirmation email sent');
    } catch (emailError) {
      console.error('❌ Failed to send confirmation email:', emailError);
    }

    // Send confirmation SMS to student if phone number exists
    if (studentPhone) {
      try {
        await sendComplaintAssignmentSMS(
          studentPhone,
          studentName,
          title,
          newComplaint._id.toString(),
          dueDate
        );
        console.log('✅ Confirmation SMS sent');
      } catch (smsError) {
        console.error('❌ Failed to send confirmation SMS:', smsError);
      }
    }

    // Return complete complaint data for real-time updates
    const responseData = {
      _id: newComplaint._id.toString(),
      title: newComplaint.title,
      description: newComplaint.description,
      category: newComplaint.category,
      priority: newComplaint.priority,
      status: newComplaint.status,
      createdAt: newComplaint.createdAt,
      dueDate: newComplaint.dueDate,
      studentName: newComplaint.studentName,
      studentCollegeId: newComplaint.studentCollegeId,
      studentEmail: newComplaint.studentEmail,
      studentPhone: newComplaint.studentPhone || '',
      department: newComplaint.department || '',
      assignedStaffName: newComplaint.assignedStaffName || assignedTo || 'Pending Assignment'
    };

    console.log('✅ Complaint submission completed:', responseData);

    return Response.json({
      success: true,
      message: 'Complaint submitted successfully!',
      data: responseData
    }, { 
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error: any) {
    console.error('Create complaint error:', error);
    
    // More detailed error information with proper typing
    let errorMessage = error.message;
    interface ErrorDetail {
      field: string;
      message: string;
      kind?: string;
    }
    const errorDetails: ErrorDetail[] = [];
    
    if (error.errors) {
      for (const key in error.errors) {
        errorDetails.push({
          field: key,
          message: error.errors[key].message,
          kind: error.errors[key].kind
        });
      }
    }
    
    return Response.json({ 
      success: false,
      error: errorMessage,
      message: 'Failed to submit complaint',
      details: errorDetails
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}

// Other HTTP methods
export async function PUT(request: Request) {
  return Response.json({ 
    success: false,
    error: 'Method not implemented' 
  }, { status: 405 });
}

export async function DELETE(request: Request) {
  return Response.json({ 
    success: false,
    error: 'Method not implemented' 
  }, { status: 405 });
}

export async function PATCH(request: Request) {
  return Response.json({ 
    success: false,
    error: 'Method not implemented' 
  }, { status: 405 });
}