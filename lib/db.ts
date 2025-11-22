import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/solveit';

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

// Use type assertion to fix the TypeScript errors
let cached = global.mongoose as MongooseCache | undefined;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

export async function connectDB() {
  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then(async (mongoose) => {
      console.log('✅ MongoDB connected successfully');
      
      // Ensure all collections exist including Staff
      await ensureAllCollections();
      
      console.log('📊 Collections: Students, Staff, Admin, Complaints');
      return mongoose;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}

// Enhanced helper function to ensure all collections exist
async function ensureAllCollections() {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }

    // Check and create Staff collection if needed
    await ensureStaffCollection();
    
    // You can add other collection checks here if needed
    await ensureComplaintsCollection();

  } catch (error) {
    console.error('❌ Error ensuring collections:', error);
    // Don't throw error - continue with connection even if collection creation fails
  }
}

// Helper function to ensure Staff collection exists (compatible with your model)
async function ensureStaffCollection() {
  try {
    const db = mongoose.connection.db;
    if (!db) return;

    // Check if Staff collection exists
    const collections = await db.listCollections({ name: 'staff' }).toArray();
    
    if (collections.length === 0) {
      console.log('🔄 Creating Staff collection...');
      
      // Import your existing Staff model
      const Staff = (await import('@/models/Staff')).default;
      
      // Create and immediately delete a temporary document to create the collection
      const tempStaff = new Staff({
        name: 'temp',
        email: 'temp@college.edu',
        phone: '0000000000',
        department: 'other',
        role: 'temp',
        collegeId: 'TEMP001',
        isActive: false
      });
      
      await tempStaff.save();
      await Staff.deleteOne({ _id: tempStaff._id });
      
      console.log('✅ Staff collection created successfully');
    } else {
      console.log('✅ Staff collection already exists');
    }

    // Create indexes for better performance using your model
    const Staff = mongoose.models.Staff;
    if (Staff) {
      await Staff.collection.createIndex({ email: 1 }, { unique: true });
      await Staff.collection.createIndex({ department: 1 });
      await Staff.collection.createIndex({ collegeId: 1 });
      await Staff.collection.createIndex({ isActive: 1 });
      console.log('✅ Staff collection indexes ensured');
    }

  } catch (error) {
    console.error('❌ Error ensuring Staff collection:', error);
  }
}

// Helper function to ensure Complaints collection exists
async function ensureComplaintsCollection() {
  try {
    const db = mongoose.connection.db;
    if (!db) return;

    const collections = await db.listCollections({ name: 'complaints' }).toArray();
    
    if (collections.length === 0) {
      console.log('🔄 Creating Complaints collection...');
      
      // Define Complaints schema for real-time updates
      const complaintSchema = new mongoose.Schema({
        title: {
          type: String,
          required: true,
          trim: true
        },
        description: {
          type: String,
          required: true
        },
        category: {
          type: String,
          required: true,
          enum: ['library', 'hostel', 'academic', 'infrastructure', 'cafeteria', 'sports', 'other']
        },
        priority: {
          type: String,
          required: true,
          enum: ['low', 'medium', 'high', 'urgent'],
          default: 'medium'
        },
        status: {
          type: String,
          required: true,
          enum: ['pending', 'assigned', 'in-progress', 'resolved', 'closed', 'escalated'],
          default: 'pending'
        },
        location: String,
        assignedStaffName: String,
        assignedStaffId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Staff'
        },
        assignedStaffRole: String,
        dueDate: Date,
        submittedBy: String, // student ID
        studentName: String,
        studentEmail: String,
        studentCollegeId: String,
        escalationLevel: {
          type: Number,
          default: 0
        },
        rating: {
          type: Number,
          min: 1,
          max: 5
        },
        feedback: String,
        resolutionNotes: String,
        resolvedAt: Date
      }, {
        timestamps: true
      });

      const Complaint = mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema);
      
      // Create and immediately delete a temporary document
      const tempComplaint = new Complaint({
        title: 'temp',
        description: 'temp',
        category: 'other',
        priority: 'medium',
        status: 'pending',
        studentName: 'temp',
        studentEmail: 'temp@college.edu',
        studentCollegeId: 'TEMP001'
      });
      
      await tempComplaint.save();
      await Complaint.deleteOne({ _id: tempComplaint._id });
      
      console.log('✅ Complaints collection created successfully');
    } else {
      console.log('✅ Complaints collection already exists');
    }

    // Create indexes for complaints
    const Complaint = mongoose.models.Complaint;
    if (Complaint) {
      await Complaint.collection.createIndex({ assignedStaffId: 1 });
      await Complaint.collection.createIndex({ status: 1 });
      await Complaint.collection.createIndex({ category: 1 });
      await Complaint.collection.createIndex({ dueDate: 1 });
      await Complaint.collection.createIndex({ submittedBy: 1 });
      console.log('✅ Complaints collection indexes ensured');
    }

  } catch (error) {
    console.error('❌ Error ensuring Complaints collection:', error);
  }
}

// Helper function to get model by role (your existing function - unchanged)
export function getUserModelByRole(role: string) {
  const { Student, Staff, Admin } = require('@/models/User');
  
  switch (role) {
    case 'student':
      return Student;
    case 'staff':
      return Staff;
    case 'admin':
      return Admin;
    default:
      throw new Error(`Invalid role: ${role}`);
  }
}

// NEW: Helper function to get Staff by department/category (compatible with your model)
export async function getStaffByDepartment(department: string) {
  try {
    await connectDB();
    const Staff = (await import('@/models/Staff')).default;
    
    const staffMembers = await Staff.find({ 
      department: department,
      isActive: true 
    }).select('name email role phone department collegeId performanceScore lastAssignedAt');
    
    return staffMembers;
  } catch (error) {
    console.error('Error fetching staff by department:', error);
    return [];
  }
}

// NEW: Helper function to get Staff by email (compatible with your model)
export async function getStaffByEmail(email: string) {
  try {
    await connectDB();
    const Staff = (await import('@/models/Staff')).default;
    
    const staff = await Staff.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    });
    return staff;
  } catch (error) {
    console.error('Error fetching staff by email:', error);
    return null;
  }
}

// NEW: Helper function to get Staff by ID (compatible with your model)
export async function getStaffById(staffId: string) {
  try {
    await connectDB();
    const Staff = (await import('@/models/Staff')).default;
    
    const staff = await Staff.findById(staffId);
    return staff;
  } catch (error) {
    console.error('Error fetching staff by ID:', error);
    return null;
  }
}

// NEW: Helper function to update staff performance metrics (compatible with your model)
export async function updateStaffPerformance(staffId: string, updateData: {
  assignedComplaints?: number;
  resolvedComplaints?: number;
  escalatedComplaints?: number;
  performanceScore?: number;
  lastAssignedAt?: Date;
}) {
  try {
    await connectDB();
    const Staff = (await import('@/models/Staff')).default;
    
    const staff = await Staff.findByIdAndUpdate(
      staffId, 
      { $set: updateData },
      { new: true }
    );
    
    if (staff && (updateData.resolvedComplaints || updateData.escalatedComplaints)) {
      // Use your model's updatePerformance method
      await staff.updatePerformance();
    }
    
    return staff;
  } catch (error) {
    console.error('Error updating staff performance:', error);
    return null;
  }
}

// NEW: Helper function to assign complaint to staff and update metrics
export async function assignComplaintToStaff(staffId: string, complaintData: any) {
  try {
    await connectDB();
    const Staff = (await import('@/models/Staff')).default;
    
    const staff = await Staff.findByIdAndUpdate(
      staffId,
      { 
        $inc: { assignedComplaints: 1 },
        $set: { lastAssignedAt: new Date() }
      },
      { new: true }
    );
    
    return staff;
  } catch (error) {
    console.error('Error assigning complaint to staff:', error);
    return null;
  }
}

// NEW: Helper function to get all active staff
export async function getAllActiveStaff() {
  try {
    await connectDB();
    const Staff = (await import('@/models/Staff')).default;
    
    const staffMembers = await Staff.find({ isActive: true })
      .select('name email role department collegeId performanceScore assignedComplaints resolvedComplaints')
      .sort({ performanceScore: -1, department: 1 });
    
    return staffMembers;
  } catch (error) {
    console.error('Error fetching all active staff:', error);
    return [];
  }
}

// Export mongoose for external use
export { mongoose };