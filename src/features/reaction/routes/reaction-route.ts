import express, { Express, Router } from 'express';
import { Get } from '@/reaction/controllers/get-reaction';
import { Remove } from '@/reaction/controllers/remove-reaction';
import { Add } from '@/reaction/controllers/add-reaction';
import { authMiddleware } from '@/global/helpers/auth-middleware';

class ReactionRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.get('/post/reactions/:postId', authMiddleware.checkAuthentication, Get.prototype.reactions);

    this.router.get('/post/single/reaction/:username/:postId', authMiddleware.checkAuthentication, Get.prototype.getSinglePostReactionByUsername);

    this.router.get('/post/single/reactions/:username', authMiddleware.checkAuthentication, Get.prototype.getReactionsByUsername);

    this.router.post('/post/reaction', authMiddleware.checkAuthentication, Add.prototype.reaction);

    this.router.delete('/post/reaction/:postId/:previousReaction/:postReactions', authMiddleware.checkAuthentication, Remove.prototype.reaction);
    return this.router;
  }
}

export const reactionRoutes: ReactionRoutes = new ReactionRoutes();
//
