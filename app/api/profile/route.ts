// app/api/profile/route.ts
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    await connectDB();
    console.log('🔍 Fetching user profile...');

    const authHeader = request.headers.get('Authorization');
    console.log('📦 Auth header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid authorization header');
      return Response.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    console.log('🔑 Token received:', token ? 'Present' : 'Missing');
    
    try {
      console.log('🔐 Verifying token...');
      const decoded = verifyToken(token) as any;
      console.log('✅ Token verified, user ID:', decoded.userId);
      
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        console.log('❌ User not found in database');
        return Response.json({ error: 'User not found' }, { status: 404 });
      }

      console.log('✅ User found:', user.name);
      
      return Response.json({ 
        user: {
          id: user._id.toString(),
          collegeId: user.collegeId,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          phone: user.phone
        }
      }, { status: 200 });

    } catch (tokenError: any) {
      console.error('❌ Token verification failed:', tokenError.message);
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

  } catch (error: any) {
    console.error('❌ Profile fetch error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}