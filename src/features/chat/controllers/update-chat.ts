import { markMessageSchema } from '@/chat/schema/message';
import { IMessageData } from '@/chat/interfaces/message.interface';
import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import { MessageCache } from '@/service/redis/message.cache';
import { ADD_OR_REMOVE_MESSAGE_REACTION, MARK_MESSAGE_AS_READ, chatQueue } from '@/service/queues/chat.queue';
import { socketIOChatObject } from '@/socket/chat';
import { joiValidation } from '@/global/decorators/joi-validation.decorator';

const messageCache: MessageCache = new MessageCache();

export class Update {
  @joiValidation(markMessageSchema)
  public async markMessageAsRead(req: Request, res: Response): Promise<void> {
    const { receiver, sender } = req.body;
    const updatedMessage: IMessageData = await messageCache.updateChatMessage(sender, receiver);
    socketIOChatObject.emit('MESSAGE_READ', updatedMessage);
    socketIOChatObject.emit('CHAT_LIST', updatedMessage);
    chatQueue.addChatJob(MARK_MESSAGE_AS_READ, {
      senderId: new mongoose.Types.ObjectId(sender),
      receiverId: new mongoose.Types.ObjectId(receiver)
    });

    res.status(HTTP_STATUS.OK).json({
      message: 'Messages marked as read'
    });
  }

  public async messageReaction(req: Request, res: Response): Promise<void> {
    const { messageId, reaction, type, conversationId } = req.body;
    const senderName = `${req.currentUser?.username}`;

    const updatedMessage: IMessageData = await messageCache.updateMessageReaction(conversationId, messageId, reaction, senderName, type);

    socketIOChatObject.emit('ADDED_REACTION', updatedMessage);
    // socketIOChatObject.emit('CHAT_LIST', updatedMessage);

    chatQueue.addChatJob(ADD_OR_REMOVE_MESSAGE_REACTION, {
      messageId: new mongoose.Types.ObjectId(messageId),
      senderName,
      reaction,
      type
    });

    res.status(HTTP_STATUS.OK).json({
      message: 'Messages reaction added'
    });
  }
}
