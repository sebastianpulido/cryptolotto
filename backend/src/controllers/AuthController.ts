import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, name, password } = req.body;

      // Verificar si el usuario ya existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          error: 'El usuario ya existe' 
        });
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear usuario
      const { data: user, error } = await supabase
        .from('users')
        .insert({
          email,
          name,
          password: hashedPassword
        })
        .select()
        .single();

      if (error) throw error;

      // Generar JWT
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        data: { user, token }
      });
    } catch (error) {
      logger.error('Error en registro:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Buscar usuario
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) {
        return res.status(401).json({
          success: false,
          error: 'Credenciales inválidas'
        });
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Credenciales inválidas'
        });
      }

      // Generar JWT
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      // Remover password de la respuesta
      delete user.password;

      res.json({
        success: true,
        data: { user, token }
      });
    } catch (error) {
      logger.error('Error en login:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  static async googleAuth(req: Request, res: Response) {
    try {
      // Implementar autenticación con Google
      res.json({ success: true, message: 'Google auth no implementado aún' });
    } catch (error) {
      logger.error('Error en Google auth:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  static async logout(req: Request, res: Response) {
    res.json({ success: true, message: 'Logout exitoso' });
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      delete user.password;
      res.json({ success: true, data: user });
    } catch (error) {
      logger.error('Error obteniendo perfil:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }
}