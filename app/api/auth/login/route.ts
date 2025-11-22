import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    console.log('🔐 Starting login process...');
    
    await connectDB();
    console.log('✅ Database connected');

    const body = await request.json();
    console.log('📦 Login request received:', body);

    const { collegeId, password, role } = body;

    // Basic validation
    if (!collegeId || !password || !role) {
      console.log('❌ Missing required fields');
      return Response.json({ error: 'College ID, password, and role are required' }, { status: 400 });
    }

    console.log('🔍 Finding user with identifier:', collegeId, 'and role:', role);
    
    // Allow login with either collegeId OR email
    const user = await User.findOne({
      $or: [
        { collegeId: collegeId.trim() },
        { email: collegeId.trim().toLowerCase() }
      ],
      role: role.trim()
    });
    
    if (!user) {
      console.log('❌ User not found with identifier and role combination:', collegeId, role);
      return Response.json({ 
        error: 'Invalid credentials. Please check your College ID/Email, password, and role selection.' 
      }, { status: 401 });
    }

    if (!user.isActive) {
      console.log('❌ User account is inactive');
      return Response.json({ error: 'Account is inactive. Please contact administrator.' }, { status: 401 });
    }

    console.log('🔑 Verifying password...');
    // Verify password
    const isPasswordValid = await compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return Response.json({ 
        error: 'Invalid credentials. Please check your College ID/Email, password, and role selection.' 
      }, { status: 401 });
    }

    console.log('✅ Password verified successfully');
    
    // FIXED: Use JWT_SECRET from environment variables
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('❌ JWT_SECRET is not set in environment variables');
      return Response.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    console.log('🔑 Using JWT secret for token creation');
    
    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user._id.toString(),
        collegeId: user.collegeId,
        role: user.role 
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // Return user data (excluding password)
    const userResponse = {
      id: user._id.toString(),
      collegeId: user.collegeId,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      phone: user.phone,
      category: user.category,
      isActive: user.isActive
    };

    console.log('🎉 Login successful for user:', userResponse.name, 'Role:', userResponse.role);
    
    return Response.json({
      message: 'Login successful',
      token,
      user: userResponse,
      redirectTo: getRedirectPath(user.role)
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Login error:', error);
    
    return Response.json({ 
      error: 'Login failed. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// Helper function to determine redirect path based on role
function getRedirectPath(role: string): string {
  switch (role) {
    case 'student':
      return '/student/dashboard';
    case 'staff':
      return '/staff/dashboard';
    case 'admin':
      return '/admin/dashboard';
    default:
      return '/student/dashboard';
  }
}