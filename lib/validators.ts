import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email address').max(100, 'Email too long'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password too long'),
  role: z.enum(['student', 'admin', 'staff']).default('student'),
  collegeId: z.string().min(1, 'College ID is required').max(50, 'College ID too long'),
  department: z.string().min(1, 'Department is required').max(100, 'Department name too long'),
  phone: z.string().min(10, 'Valid phone number is required').max(15, 'Phone number too long'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  collegeId: z.string().min(1, 'College ID is required'),
  role: z.enum(['student', 'admin', 'staff']),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;