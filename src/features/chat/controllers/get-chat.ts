import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { MessageCache } from '@/service/redis/message.cache';
import { IMessageData } from '../interfaces/message.interface';
import { chatService } from '@/service/db/chat.service';
import mongoose, { Types } from 'mongoose';
const messageCache: MessageCache = new MessageCache();
export class Get {
  public async conversationList(req: Request, res: Response): Promise<void> {
    let conversations: IMessageData[] = [];
    const cachedConversation: IMessageData[] = await messageCache.getUserConversationList(`${req.currentUser?.userId}`);
    if (cachedConversation.length) {
      conversations = cachedConversation;
    } else {
      conversations = await chatService.getUserConversationList(new mongoose.Types.ObjectId(`${req.currentUser?.userId}`));
    }
    res.status(HTTP_STATUS.OK).json({
      message: 'All Chats List',
      data: conversations
    });
  }
  public async messages(req: Request, res: Response): Promise<void> {
    const { receiverId } = req.params;

    let messages: IMessageData[] = [];
    const cachedMessages: IMessageData[] = await messageCache.getChatMessageList(`${req.currentUser?.userId}`, receiverId);
    if (cachedMessages.length) {
      messages = cachedMessages;
    } else {
      const senderObjectId: Types.ObjectId = new mongoose.Types.ObjectId(`${req.currentUser?.userId}`);
      const receiveObjectId: Types.ObjectId = new mongoose.Types.ObjectId(`${receiverId}`);
      messages = await chatService.getMessages(senderObjectId, receiveObjectId, { createdAt: -1 });
    }
    res.status(HTTP_STATUS.OK).json({
      message: 'All messages List',
      data: messages
    });
  }
}
