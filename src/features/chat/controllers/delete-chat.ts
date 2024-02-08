import { IMessageData } from '@/chat/interfaces/message.interface';
import { MARK_MESSAGE_AS_DELETED, chatQueue } from '@/service/queues/chat.queue';
import { MessageCache } from '@/service/redis/message.cache';
import { socketIOChatObject } from '@/socket/chat';
import { Request, Response } from 'express';
const messageCache: MessageCache = new MessageCache();
export class Delete {
  public async markMessageAsDeleted(req: Request, res: Response): Promise<void> {
    const { senderId, receiverId, messageId, type } = req.params;

    const updatedMessage: IMessageData = await messageCache.markMessageAsDelete(`${senderId}`, `${receiverId}`, `${messageId}`, type);

    socketIOChatObject.emit('MESSAGE_READ', updatedMessage);
    socketIOChatObject.emit('CHAT_LIST', updatedMessage);
    chatQueue.addChatJob(MARK_MESSAGE_AS_DELETED, {
      messageId,
      type
    });

    res.status(200).json({
      message: 'Message mark as a deleted',
      data: updatedMessage
    });
  }
}
