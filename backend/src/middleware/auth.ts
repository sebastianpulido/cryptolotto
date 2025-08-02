import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.header('Authorization');
    console.log('🔐 Auth middleware - Authorization header:', authHeader ? authHeader.substring(0, 30) + '...' : 'No header');
    
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      console.log('❌ Auth middleware - No token provided');
      res.status(401).json({ success: false, error: 'Token no proporcionado' });
      return;
    }

    console.log('🔍 Auth middleware - Token received:', token.substring(0, 20) + '...');
    console.log('🌍 Auth middleware - NODE_ENV:', process.env.NODE_ENV);
    console.log('🔍 Auth middleware - Token starts with mock_jwt_token_:', token.startsWith('mock_jwt_token_'));
    console.log('🔍 Auth middleware - Is development:', process.env.NODE_ENV === 'development');

    // Handle mock tokens for development
    if (process.env.NODE_ENV === 'development' && token.startsWith('mock_jwt_token_')) {
      console.log('✅ Auth middleware - Using mock token for development');
      // Create mock user for development
      (req as any).user = {
        id: '1',
        email: 'demo@cryptolotto.com',
        role: 'user'
      };
      console.log('👤 Auth middleware - Mock user created:', (req as any).user);
      next();
      return;
    }

    console.log('🔑 Auth middleware - Attempting to verify real JWT token');
    // Verify real JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
    
    // Get user from Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      console.log('❌ Auth middleware - User not found in database');
      res.status(401).json({ success: false, error: 'Usuario no encontrado' });
      return;
    }

    (req as any).user = user;
    next();
  } catch (error) {
    console.log('❌ Auth middleware - Error:', error);
    console.log('❌ Auth middleware - Error type:', typeof error);
    console.log('❌ Auth middleware - Error message:', error instanceof Error ? error.message : 'Unknown error');
    res.status(401).json({ success: false, error: 'Token inválido' });
  }
};
