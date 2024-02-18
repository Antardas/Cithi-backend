import { Get } from '@/chat/controllers/get-chat';
import { authUserPayload } from '@/root/mocks/auth.mock';
import { chatMessage, chatMockRequest, chatMockResponse, messageDataMock, mockMessageId } from '@/root/mocks/chat.mock';
import { Request, Response } from 'express';
import * as chatServer from '@/socket/chat';
import { Server } from 'socket.io';
import { UserCache } from '@/service/redis/user.cache';
import { MessageCache } from '@/service/redis/message.cache';
import { userService } from '@/service/db/user.service';
import { existingUser, existingUserTwo } from '@/root/mocks/user.mock';
import { RECEIVED_MESSAGE_EMAIL, emailQueue } from '@/service/queues/email.queue';
import { notificationTemplate } from '@/service/emails/notifications/notification-template';
import { chatQueue } from '@/service/queues/chat.queue';
import mongoose from 'mongoose';
import { IMessageData } from '@/chat/interfaces/message.interface';
import { Update } from '@/chat/controllers/update-chat';
import { Delete } from '@/chat/controllers/delete-chat';
import { chatService } from '@/service/db/chat.service';

jest.useFakeTimers();
jest.mock('@/service/redis/message.cache');
jest.mock('@/service/queues/base.queue');

Object.defineProperties(chatServer, {
  socketIOChatObject: {
    value: new Server(),
    writable: true
  }
});

describe('Delete', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('conversationList', () => {
    it('should send correct json response if chat list exist in redis', async () => {
      const req: Request = chatMockRequest({}, {}, authUserPayload) as Request;
      const res: Response = chatMockResponse();
      jest.spyOn(MessageCache.prototype, 'getUserConversationList').mockResolvedValue([messageDataMock]);

      await Get.prototype.conversationList(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All Chats List',
        data: [messageDataMock]
      });
    });

    it('should send correct json response if no chat list response from redis', async () => {
      const req: Request = chatMockRequest({}, {}, authUserPayload) as Request;
      const res: Response = chatMockResponse();
      jest.spyOn(MessageCache.prototype, 'getUserConversationList').mockResolvedValue([]);
      jest.spyOn(chatService, 'getUserConversationList').mockResolvedValue([messageDataMock]);

      await Get.prototype.conversationList(req, res);
      expect(chatService.getUserConversationList).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All Chats List',
        data: [messageDataMock]
      });
    });

    it('should send correct json response with empty chat list if it does not exist (redis & database)', async () => {
      const req: Request = chatMockRequest({}, chatMessage, authUserPayload) as Request;
      const res: Response = chatMockResponse();
      jest.spyOn(MessageCache.prototype, 'getUserConversationList').mockResolvedValue([]);
      jest.spyOn(chatService, 'getUserConversationList').mockResolvedValue([]);

      await Get.prototype.conversationList(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All Chats List',
        data: []
      });
    });
  });

  describe('messages', () => {
    it('should send correct json response if chat messages exist in redis', async () => {
      const req: Request = chatMockRequest({}, chatMessage, authUserPayload, {
        receiverId: '60263f14648fed5246e322d8'
      }) as Request;
      const res: Response = chatMockResponse();
      jest.spyOn(MessageCache.prototype, 'getChatMessageList').mockResolvedValue([messageDataMock]);

      await Get.prototype.messages(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All messages List',
        data: [messageDataMock]
      });
    });

    it('should send correct json response if no chat message response from redis', async () => {
      const req: Request = chatMockRequest({}, chatMessage, authUserPayload, {
        receiverId: '60263f14648fed5246e322d8'
      }) as Request;
      const res: Response = chatMockResponse();
      jest.spyOn(MessageCache.prototype, 'getChatMessageList').mockResolvedValue([]);
      jest.spyOn(chatService, 'getMessages').mockResolvedValue([messageDataMock]);

      await Get.prototype.messages(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All messages List',
        data: [messageDataMock]
      });
    });

    it('should send correct json response with empty chat messages if it does not exist (redis & database)', async () => {
      const req: Request = chatMockRequest({}, chatMessage, authUserPayload, {
        receiverId: '6064793b091bf02b6a71067a'
      }) as Request;
      const res: Response = chatMockResponse();
      jest.spyOn(MessageCache.prototype, 'getChatMessageList').mockResolvedValue([]);
      jest.spyOn(chatService, 'getMessages').mockResolvedValue([]);

      await Get.prototype.messages(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All messages List',
        data: []
      });
    });
  });
});
