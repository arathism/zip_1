import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStaff extends Document {
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  collegeId: string;
  isActive: boolean;
  assignedComplaints: number;
  resolvedComplaints: number;
  escalatedComplaints: number;
  performanceScore: number;
  lastAssignedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  updatePerformance: () => Promise<IStaff>;
}

const StaffSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
      enum: ['hostel', 'academic', 'infrastructure', 'library', 'cafeteria', 'sports', 'other'],
    },
    role: {
      type: String,
      required: true,
    },
    collegeId: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    assignedComplaints: {
      type: Number,
      default: 0,
    },
    resolvedComplaints: {
      type: Number,
      default: 0,
    },
    escalatedComplaints: {
      type: Number,
      default: 0,
    },
    performanceScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    lastAssignedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Update performance score when complaints are resolved or escalated
StaffSchema.methods.updatePerformance = function() {
  const totalHandled = this.assignedComplaints || 1;
  const resolutionRate = (this.resolvedComplaints / totalHandled) * 100;
  const escalationPenalty = this.escalatedComplaints * 10;
  
  this.performanceScore = Math.max(0, resolutionRate - escalationPenalty);
  return this.save();
};

// Export the model properly
const Staff: Model<IStaff> = mongoose.models.Staff || mongoose.model<IStaff>('Staff', StaffSchema);
export default Staff;