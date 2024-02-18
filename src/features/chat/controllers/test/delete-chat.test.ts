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

  describe('markMessageAsDeleted', () => {
    it('should send correct json response (deleteForMe)', async () => {
      const req: Request = chatMockRequest({}, {}, authUserPayload, {
        senderId: `${existingUser._id}`,
        receiverId: '60263f14648fed5246e322d8',
        messageId: `${mockMessageId}`,
        type: 'me'
      }) as Request;
      const res: Response = chatMockResponse();
      const messageCached = jest.spyOn(MessageCache.prototype, 'markMessageAsDelete').mockResolvedValue(messageDataMock);
      jest.spyOn(chatServer.socketIOChatObject, 'emit');
      jest.spyOn(chatQueue, 'addChatJob');

      await Delete.prototype.markMessageAsDeleted(req, res);
      expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledTimes(2);
      expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledWith('MESSAGE_READ', messageDataMock);
      expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledWith('CHAT_LIST', messageDataMock);
      expect(chatQueue.addChatJob).toHaveBeenCalledWith('MARK_MESSAGE_AS_DELETED', {
        messageId: `${mockMessageId}`,
        type: 'me'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Message mark as a deleted',
        data: await messageCached.mock.results[0].value
      });
    });

    it('should send correct json response (deleteForEveryone)', async () => {
      const req: Request = chatMockRequest({}, {}, authUserPayload, {
        senderId: `${existingUser._id}`,
        receiverId: '60263f14648fed5246e322d8',
        messageId: `${mockMessageId}`,
        type: 'everyone'
      }) as Request;
      const res: Response = chatMockResponse();
      const messageCached = jest.spyOn(MessageCache.prototype, 'markMessageAsDelete').mockResolvedValue(messageDataMock);
      jest.spyOn(chatServer.socketIOChatObject, 'emit');
      jest.spyOn(chatQueue, 'addChatJob');

      await Delete.prototype.markMessageAsDeleted(req, res);
      expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledTimes(2);
      expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledWith('MESSAGE_READ', messageDataMock);
      expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledWith('CHAT_LIST', messageDataMock);
      expect(chatQueue.addChatJob).toHaveBeenCalledWith('MARK_MESSAGE_AS_DELETED', {
        messageId: `${mockMessageId}`,
        type: 'everyone'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Message mark as a deleted',
        data: await messageCached.mock.results[0].value
      });
    });
  });
});
