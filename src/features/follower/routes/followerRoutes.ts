import { Get } from './../controllers/get-followers';
import { Remove } from '@/follower/controllers/unfollow-user';
import { Add } from '@/follower/controllers/follower-user';
import { authMiddleware } from '@/global/helpers/auth-middleware';
import express, { Router } from 'express';

class FollowerRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.put('/users/follow/:followeeId', authMiddleware.checkAuthentication, Add.prototype.follower);
    this.router.put('/users/unfollow/:followeeId', authMiddleware.checkAuthentication, Remove.prototype.follower);
    this.router.get('/users/followers', authMiddleware.checkAuthentication, Get.prototype.followers);
    this.router.get('/users/followings', authMiddleware.checkAuthentication, Get.prototype.followings);
    return this.router;
  }
}

export const followerRoutes: FollowerRoutes = new FollowerRoutes();
