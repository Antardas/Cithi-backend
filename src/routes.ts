import { authRoutes } from '@/auth/routes/authRoutes';
import { currentUserRoutes } from '@/auth/routes/currentRoute';
import { commentRoutes } from '@/comment/routes/comment-route';
import { authMiddleware } from '@/global/helpers/auth-middleware';
import { postRoutes } from '@/post/routes/postRoutes';
import { reactionRoutes } from '@/reaction/routes/reaction-route';
import { serverAdapter } from '@/service/queues/base.queue';
import { Application } from 'express';
const BASE_PATH = '/api/v1';
export default (app: Application) => {
  const routes = () => {
    app.use('/queues', serverAdapter.getRouter());
    app.use(BASE_PATH, authRoutes.routes());
    app.use(BASE_PATH, authRoutes.signOutRoute());
    app.use(BASE_PATH, authMiddleware.verify, currentUserRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verify, postRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verify, reactionRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verify, commentRoutes.routes());
  };

  routes();
};
