// lib/auth.ts
import jwt from 'jsonwebtoken';

export function verifyToken(token: string): any {
  try {
    console.log('🔐 Verifying token...');
    
    // FIXED: Use JWT_SECRET from environment variables
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('❌ JWT_SECRET is not set in environment variables');
      throw new Error('Server configuration error');
    }
    
    console.log('🔑 JWT Secret for verification: Set');
    
    const decoded = jwt.verify(token, jwtSecret);
    console.log('✅ Token decoded successfully');
    return decoded;
  } catch (error: any) {
    console.error('❌ Token verification error:', error.message);
    throw new Error('Invalid token');
  }
}