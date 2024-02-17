import { Create } from '@/post/controllers/create-post';
import express, { Router } from 'express';

import { authMiddleware } from '@/global/helpers/auth-middleware';
import { Get } from '@/post/controllers/get-posts';
import { Delete } from '@/post/controllers/delete-post';
import { Update } from '@/post/controllers/update-post';
class PostRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/post', authMiddleware.checkAuthentication, Create.prototype.post);
    this.router.post('/post/image', authMiddleware.checkAuthentication, Create.prototype.postWithImage);
    this.router.post('/post/video', authMiddleware.checkAuthentication, Create.prototype.postWithVideo);

    this.router.get('/post/all/:page', authMiddleware.checkAuthentication, Get.prototype.posts);
    this.router.get('/post/all/images/:page', authMiddleware.checkAuthentication, Get.prototype.postsWithImages);

    this.router.put('/post/:postId', authMiddleware.checkAuthentication, Update.prototype.post);
    this.router.put('/post/image/:postId', authMiddleware.checkAuthentication, Update.prototype.postWithImage);

    this.router.delete('/post/:postId', authMiddleware.checkAuthentication, Delete.prototype.post);

    return this.router;
  }
}

export const postRoutes: PostRoutes = new PostRoutes();
