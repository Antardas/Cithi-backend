import { Delete } from '@/chat/controllers/delete-chat';
import { Add } from '@/chat/controllers/add-chat';
import { authMiddleware } from '@/global/helpers/auth-middleware';
import express, { Router } from 'express';
import { Get } from '@/chat/controllers/get-chat';

class ChatRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  routes(): Router {
    this.router.get('/chat/message/conversation', authMiddleware.checkAuthentication, Get.prototype.conversationList);
    this.router.get('/chat/message/user/:receiverId', authMiddleware.checkAuthentication, Get.prototype.messages);
    this.router.post('/chat/message', authMiddleware.checkAuthentication, Add.prototype.message);
    this.router.post('/chat/message/users', authMiddleware.checkAuthentication, Add.prototype.addMessageUsers);
    this.router.post('/chat/message/remove-users', authMiddleware.checkAuthentication, Add.prototype.removeMessageUsers);
    this.router.delete('/chat/message/:messageId/:senderId/:receiverId/:type', authMiddleware.checkAuthentication, Delete.prototype.markMessageAsDeleted);
    return this.router;
  }
}

export const chatRoutes: ChatRoutes = new ChatRoutes();
