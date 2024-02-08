import { Add } from '@/chat/controllers/add-chat';
import { authUserPayload } from '@/root/mocks/auth.mock';
import { chatMessage, chatMockRequest, chatMockResponse, messageDataMock } from '@/root/mocks/chat.mock';
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

  it('should call socket.io emit twice', async () => {
    jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(existingUser);
    jest.spyOn(userService, 'getUserById').mockResolvedValue(existingUser);
    jest.spyOn(chatServer.socketIOChatObject, 'emit');
    const req: Request = chatMockRequest({}, chatMessage, authUserPayload) as Request;
    const res: Response = chatMockResponse();

    await Add.prototype.message(req, res);
    expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledTimes(2);
  });

  it('should call addEmailJob method', async () => {
    existingUserTwo.notifications.messages = true;
    const req: Request = chatMockRequest({}, chatMessage, authUserPayload) as Request;
    const res: Response = chatMockResponse();
    jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(existingUserTwo);
    jest.spyOn(emailQueue, 'addEmailJob');

    const templateParams = {
      username: existingUserTwo.username!,
      message: chatMessage.body,
      header: `Message notification from ${req.currentUser!.username}`
    };
    const template: string = notificationTemplate.notificationMessageTemplate(templateParams);

    await Add.prototype.message(req, res);
    expect(emailQueue.addEmailJob).toHaveBeenCalledWith(RECEIVED_MESSAGE_EMAIL, {
      receiverEmail: existingUserTwo.email!,
      template,
      subject: `You've received message from ${req.currentUser!.username!}`
    });
  });

  it('should not call addEmailJob method', async () => {
    chatMessage.isRead = true;
    const req: Request = chatMockRequest({}, chatMessage, authUserPayload) as Request;
    const res: Response = chatMockResponse();
    jest.spyOn(emailQueue, 'addEmailJob');

    const templateParams = {
      username: existingUserTwo.username!,
      message: chatMessage.body,
      header: `Message Notification from ${req.currentUser!.username}`
    };
    const template: string = notificationTemplate.notificationMessageTemplate(templateParams);

    await Add.prototype.message(req, res);
    expect(emailQueue.addEmailJob).not.toHaveBeenCalledWith('directMessageMail', {
      receiverEmail: req.currentUser!.email,
      template,
      subject: `You've received messages from ${existingUserTwo.username!}`
    });
  });

  it('should call addChatListToCache twice', async () => {
    jest.spyOn(MessageCache.prototype, 'addChatListToCache');
    const req: Request = chatMockRequest({}, chatMessage, authUserPayload) as Request;
    const res: Response = chatMockResponse();

    await Add.prototype.message(req, res);
    expect(MessageCache.prototype.addChatListToCache).toHaveBeenCalledTimes(2);
  });

  it('should call addChatMessageToCache', async () => {
    jest.spyOn(MessageCache.prototype, 'addMessageToCache');
    const req: Request = chatMockRequest({}, chatMessage, authUserPayload) as Request;
    const res: Response = chatMockResponse();

    await Add.prototype.message(req, res);
    expect(MessageCache.prototype.addMessageToCache).toHaveBeenCalledTimes(1);
  });

  it('should call chatQueue addChatJob', async () => {
    jest.spyOn(chatQueue, 'addChatJob');
    const req: Request = chatMockRequest({}, chatMessage, authUserPayload) as Request;
    const res: Response = chatMockResponse();

    await Add.prototype.message(req, res);
    expect(chatQueue.addChatJob).toHaveBeenCalledTimes(1);
  });

  it('should send correct json response', async () => {
    const req: Request = chatMockRequest({}, chatMessage, authUserPayload) as Request;
    const res: Response = chatMockResponse();
    const chatQueueSpy = jest.spyOn(chatQueue, 'addChatJob');
    await Add.prototype.message(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    const data: IMessageData = chatQueueSpy.mock.calls[0][1] as IMessageData;
    expect(res.json).toHaveBeenCalledWith({
      message: 'Message added',
      data: {
        messageId: new mongoose.Types.ObjectId(`${data._id}`).toString(),
        conversationId: new mongoose.Types.ObjectId(`${chatMessage.conversationId}`).toString()
      }
    });
  });
});
