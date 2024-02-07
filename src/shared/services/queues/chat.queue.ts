import { IAuthJob } from '@/auth/interfaces/auth.interface';
import { IMessageData, IMessageJobData } from '@/chat/interfaces/message.interface';
import { BaseQueue } from '@/service/queues/base.queue';
import { authWorker } from '@/worker/auth.worker';
import { chatWorker } from '@/worker/chat.worker';
export const ADD_CHAT_TO_DB: string = 'ADD_CHAT_TO_DB';
export const MARK_MESSAGE_AS_DELETED: string = 'MARK_MESSAGE_AS_DELETED';
export const MARK_MESSAGE_AS_READ: string = 'MARK_MESSAGE_AS_READ';
class ChatQueue extends BaseQueue {
  constructor() {
    super('chat');
    this.processJob(ADD_CHAT_TO_DB, 5, chatWorker.addMessageToDB);
    this.processJob(MARK_MESSAGE_AS_DELETED, 5, chatWorker.markMessageAsDeleted);
    this.processJob(MARK_MESSAGE_AS_READ, 5, chatWorker.markMessageAsRead);
  }
  public addChatJob(name: string, data: IMessageData | IMessageJobData) {
    this.addJob(name, data);
  }
}

export const chatQueue: ChatQueue = new ChatQueue();
