import { authMiddleware } from '@/global/helpers/auth-middleware';
import { Router } from 'express';
import { Get } from '@/comment/controllers/get-comment';
import { Add} from '@/comment/controllers/add-comment';
class CommentRoutes {
  private router: Router;

  constructor() {
    this.router = Router();
  }

  public routes(): Router {


    this.router.post('/comments', authMiddleware.checkAuthentication, Add.prototype.comment);

    this.router.get('/comments/names/:postId', authMiddleware.checkAuthentication, Get.prototype.commentNames);
    this.router.get('/comments/:postId', authMiddleware.checkAuthentication, Get.prototype.comments);
    this.router.get('/comments/:postId/:commentId', authMiddleware.checkAuthentication, Get.prototype.singleComment);
    return this.router;
  }
}

export const commentRoutes: CommentRoutes = new CommentRoutes();
