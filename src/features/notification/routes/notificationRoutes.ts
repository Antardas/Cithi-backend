import { Get } from '@/notification/controllers/get-notification';
import express, { Router } from 'express';
import { authMiddleware } from '@/global/helpers/auth-middleware';
import { Update } from '@/notification/controllers/update-notification';
import { Delete } from '@/notification/controllers/delete-notification';
class NotificationRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }

  routes(): Router {
    this.router.put('/notifications/:id', authMiddleware.checkAuthentication, Update.prototype.notification);
    this.router.get('/notifications', authMiddleware.checkAuthentication, Get.prototype.notification);
    this.router.delete('/notifications/:id', authMiddleware.checkAuthentication, Delete.prototype.notification);
    return this.router;
  }
}

export const notificationRoutes: NotificationRoutes = new NotificationRoutes();
