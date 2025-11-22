// models/User.ts
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  collegeId: {
    type: String,
    required: [true, 'College ID is required'],
    unique: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['student', 'staff', 'admin'],
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  // Student fields
  semester: {
    type: String,
    default: '1'
  },
  rollNumber: {
    type: String
  },
  parentPhone: {
    type: String
  },
  address: {
    type: String
  },
  // Staff fields
  category: {
    type: String
  },
  designation: {
    type: String,
    default: 'Staff Member'
  },
  specialization: {
    type: String
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  // Admin fields
  accessLevel: {
    type: String,
    default: 'department'
  },
  permissions: {
    type: Object,
    default: {
      canManageUsers: false,
      canManageComplaints: true,
      canManageSystem: false,
      canViewReports: true
    }
  },
  assignedDepartments: [{
    type: String
  }]
}, {
  timestamps: true
});

// Prevent model overwrite error
const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;