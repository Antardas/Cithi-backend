import { Update } from '@/user/controllers/update';
import { Search } from '@/user/controllers/search-profile';
import { Router } from 'express';
import { authMiddleware } from '@/global/helpers/auth-middleware';
import { Get } from '@/user/controllers/get-profile';
class UserRoutes {
  private router: Router;

  constructor() {
    this.router = Router();
  }

  public routes(): Router {
    this.router.get('/users', authMiddleware.checkAuthentication, Get.prototype.all);
    this.router.get('/users/me', authMiddleware.checkAuthentication, Get.prototype.profile);
    this.router.get('/users/suggestions', authMiddleware.checkAuthentication, Get.prototype.randomUsersSuggestion);
    this.router.get('/users/search/:query', authMiddleware.checkAuthentication, Search.prototype.user);
    this.router.get('/users/:id', authMiddleware.checkAuthentication, Get.prototype.profileUserId);
    this.router.get('/users/:id/:username/:uId', authMiddleware.checkAuthentication, Get.prototype.profileAndPost);

    this.router.put('/users/password', authMiddleware.checkAuthentication, Update.prototype.password);
    this.router.put('/users/social-links', authMiddleware.checkAuthentication, Update.prototype.socialLinks);
    this.router.put('/users/basic-info', authMiddleware.checkAuthentication, Update.prototype.basicInfo);
    this.router.put('/users/notification-setting', authMiddleware.checkAuthentication, Update.prototype.notificationSettings);

    return this.router;
  }
}

export const userRoutes: UserRoutes = new UserRoutes();
