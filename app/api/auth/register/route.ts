import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { hash } from 'bcryptjs';
import { sendWelcomeEmail } from '@/lib/email';
import { sendWelcomeSMS } from '@/lib/sms';

export async function POST(request: Request) {
  try {
    console.log('🚀 Starting registration process...');
    
    await connectDB();
    console.log('✅ Database connected');

    const body = await request.json();
    console.log('📦 Registration request received:', { 
      ...body, 
      password: '[HIDDEN]' 
    });

    const { 
      name, 
      email, 
      collegeId, 
      password, 
      role, 
      category,
      phone,
      department // Make sure department is extracted
    } = body;

    // Basic validation - include department in required fields
    if (!name || !email || !collegeId || !password || !role || !phone || !department) {
      console.log('❌ Missing required fields:', {
        name: !!name,
        email: !!email,
        collegeId: !!collegeId,
        password: !!password,
        role: !!role,
        phone: !!phone,
        department: !!department
      });
      return Response.json({ 
        success: false,
        error: 'All fields are required including department' 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ 
        success: false,
        error: 'Invalid email format' 
      }, { status: 400 });
    }

    // Validate password strength
    if (password.length < 6) {
      return Response.json({ 
        success: false,
        error: 'Password must be at least 6 characters long' 
      }, { status: 400 });
    }

    // Validate phone format
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return Response.json({ 
        success: false,
        error: 'Invalid phone number format' 
      }, { status: 400 });
    }

    // Validate category for staff role
    if (role === 'staff' && !category) {
      return Response.json({ 
        success: false,
        error: 'Complaint category is required for staff role' 
      }, { status: 400 });
    }

    console.log('🔍 Checking for existing users...');
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { collegeId: collegeId.trim() },
        { email: email.trim().toLowerCase() },
        { phone: phone.trim() }
      ]
    });

    if (existingUser) {
      console.log('❌ User already exists');
      const field = existingUser.collegeId === collegeId ? 'College ID' : 
                   existingUser.email === email ? 'Email' : 'Phone number';
      return Response.json({ 
        success: false,
        error: `${field} already registered` 
      }, { status: 409 });
    }

    console.log('🔑 Hashing password...');
    // Hash password
    const hashedPassword = await hash(password, 12);

    console.log('📝 Creating new user...');
    // Create new user - include department in user data
    const userData: any = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      collegeId: collegeId.trim(),
      password: hashedPassword,
      role: role.trim(),
      phone: phone.trim(),
      department: department.trim(), // Make sure department is included
      isActive: true
    };

    // Add category for staff
    if (role === 'staff' && category) {
      userData.category = category.trim();
    }

    console.log('📋 User data to save:', userData);

    const newUser = new User(userData);
    await newUser.save();
    console.log('✅ User saved to database');

    // Send notifications
    const notifications = {
      email: 'failed',
      sms: 'failed'
    };

    // Send welcome email
    try {
      await sendWelcomeEmail(email, name, role, collegeId);
      notifications.email = 'sent';
      console.log('✅ Welcome email sent');
    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError);
    }

    // Send welcome SMS
    try {
      await sendWelcomeSMS(phone, name, role);
      notifications.sms = 'sent';
      console.log('✅ Welcome SMS sent');
    } catch (smsError) {
      console.error('❌ Failed to send welcome SMS:', smsError);
    }

    // Return success response
    const userResponse = {
      id: newUser._id.toString(),
      collegeId: newUser.collegeId,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      department: newUser.department,
      category: newUser.category,
      isActive: newUser.isActive
    };

    console.log('🎉 Registration successful for user:', userResponse.name);
    
    return Response.json({
      success: true,
      message: 'Registration successful! Welcome to SolveIT.',
      user: userResponse,
      notifications: notifications,
      redirectTo: '/auth/login'
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Registration error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return Response.json({ 
        success: false,
        error: `${field === 'collegeId' ? 'College ID' : field === 'email' ? 'Email' : 'Phone number'} already exists` 
      }, { status: 409 });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      console.log('❌ Validation errors:', errors);
      return Response.json({ 
        success: false,
        error: 'Validation failed',
        details: errors.join(', ')
      }, { status: 400 });
    }
    
    return Response.json({ 
      success: false,
      error: 'Registration failed. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ 
    success: false,
    error: 'Method not allowed' 
  }, { status: 405 });
}