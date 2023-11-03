import { Create } from '@/post/controllers/create-post';
import express, { Router } from 'express';

import { authMiddleware } from '@/global/helpers/auth-middleware';
import { Get } from '../controllers/get-posts';
import { Delete } from '../controllers/delete-post';
class PostRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/post', authMiddleware.checkAuthentication, Create.prototype.post);
    this.router.post('/post/image', authMiddleware.checkAuthentication, Create.prototype.postWithImage);

    this.router.get('/post/all/:page', authMiddleware.checkAuthentication, Get.prototype.posts);
    this.router.get('/post/all/images/:page', authMiddleware.checkAuthentication, Get.prototype.postsWithImages);

    this.router.delete('/post/:postId', authMiddleware.checkAuthentication, Delete.prototype.post);

    return this.router;
  }
}

export const postRoutes: PostRoutes = new PostRoutes();
