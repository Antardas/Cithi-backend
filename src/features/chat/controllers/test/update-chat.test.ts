import { Add } from '@/chat/controllers/add-chat';
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

jest.useFakeTimers();
jest.mock('@/service/redis/user.cache');
jest.mock('@/service/redis/message.cache');
jest.mock('@/service/db/user.service');
jest.mock('@/service/queues/email.queue');
jest.mock('@/service/queues/chat.queue');
jest.mock('@/service/queues/base.queue');

Object.defineProperties(chatServer, {
  socketIOChatObject: {
    value: new Server(),
    writable: true
  }
});

describe('Add', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('updateChatMessage', () => {
    it('should send correct json response from redis cache', async () => {
      const req: Request = chatMockRequest(
        {},
        {
          sender: `${existingUser._id}`,
          receiver: '60263f14648fed5246e322d8'
        },
        authUserPayload
      ) as Request;
      const res: Response = chatMockResponse();
      jest.spyOn(MessageCache.prototype, 'updateChatMessage').mockResolvedValue(messageDataMock);
      jest.spyOn(chatServer.socketIOChatObject, 'emit');

      await Update.prototype.markMessageAsRead(req, res);
      expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledTimes(2);
      expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledWith('MESSAGE_READ', messageDataMock);
      expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledWith('CHAT_LIST', messageDataMock);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Messages marked as read'
      });
    });

    it('should call chatQueue addChatJob', async () => {
      const req: Request = chatMockRequest(
        {},
        {
          sender: `${existingUser._id}`,
          receiver: '60263f14648fed5246e322d8'
        },
        authUserPayload
      ) as Request;
      const res: Response = chatMockResponse();
      jest.spyOn(MessageCache.prototype, 'updateChatMessage').mockResolvedValue(messageDataMock);
      jest.spyOn(chatQueue, 'addChatJob');

      await Update.prototype.markMessageAsRead(req, res);
      expect(chatQueue.addChatJob).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Messages marked as read'
      });
    });
  });

  describe('message', () => {
    it('should call updateMessageReaction', async () => {
      const req: Request = chatMockRequest(
        {},
        {
          conversationId: '602854c81c9ca7939aaeba43',
          messageId: `${mockMessageId}`,
          reaction: 'love',
          type: 'add'
        },
        authUserPayload
      ) as Request;
      const res: Response = chatMockResponse();
      jest.spyOn(MessageCache.prototype, 'updateMessageReaction').mockResolvedValue(messageDataMock);
      jest.spyOn(chatServer.socketIOChatObject, 'emit');

      await Update.prototype.messageReaction(req, res);
      expect(MessageCache.prototype.updateMessageReaction).toHaveBeenCalledWith(
        '602854c81c9ca7939aaeba43',
        `${mockMessageId}`,
        'love',
        `${authUserPayload.username}`,
        'add'
      );
      expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledTimes(1);
      expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledWith('ADDED_REACTION', messageDataMock);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Messages reaction added'
      });
    });

    it('should call chatQueue addChatJob', async () => {
      const req: Request = chatMockRequest(
        {},
        {
          conversationId: '602854c81c9ca7939aaeba43',
          messageId: `${mockMessageId}`,
          reaction: 'love',
          type: 'add'
        },
        authUserPayload
      ) as Request;
      const res: Response = chatMockResponse();
      jest.spyOn(chatQueue, 'addChatJob');

      await Update.prototype.messageReaction(req, res);
      expect(chatQueue.addChatJob).toHaveBeenCalledWith('ADD_OR_REMOVE_MESSAGE_REACTION', {
        messageId:  new mongoose.Types.ObjectId(`${mockMessageId}`),
        senderName: req.currentUser!.username,
        reaction: 'love',
        type: 'add'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Messages reaction added'
      });
    });
  });
});
