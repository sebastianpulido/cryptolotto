import { Request, Response, NextFunction } from 'express';

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      error: 'Acceso denegado. Se requieren permisos de administrador.' 
    });
  }
  
  next();
};