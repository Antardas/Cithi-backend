import { Request, Response, NextFunction } from 'express';
import JWT from 'jsonwebtoken';
import { config } from '@/root/config';
import { NotAuthorizedError } from '@/global/helpers/error-handler';
import { AuthPayload } from '@/auth/interfaces/auth.interface';
class AuthMiddleware {
  public verify(req: Request, _res: Response, next: NextFunction): void {
    let { token } = req.cookies;
    token = token ?? req.headers.authorization;
    if (!token) {
      throw new NotAuthorizedError('Token not available. Please Log In Again.');
    }

    try {
      const payload: AuthPayload = JWT.verify(token, config.JWT_TOKEN!) as AuthPayload;

      req.currentUser = payload;
      next();
    } catch (error) {
      throw new NotAuthorizedError('Token is invalid. Please Log In Again');
    }
  }

  public checkAuthentication(req: Request, _res: Response, next: NextFunction): void {
    if (!req.currentUser) {
      throw new NotAuthorizedError('Authentication is required access this route');
    }
    next();
  }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();
