import { Remove } from './../controllers/remove-reaction';
import { authMiddleware } from '@/global/helpers/auth-middleware';
import express, { Express, Router } from 'express';
import { Add } from '@/reaction/controllers/add-reaction';

class ReactionRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.post('/post/reaction', authMiddleware.checkAuthentication, Add.prototype.reaction);
    this.router.delete('/post/reaction/:postId/:previousReaction/:postReactions', authMiddleware.checkAuthentication, Remove.prototype.reaction);
    return this.router;
  }
}

export const reactionRoutes: ReactionRoutes = new ReactionRoutes();
//
