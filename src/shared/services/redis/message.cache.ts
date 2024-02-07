import { IMessageData, IMessageList, IConversationUsers, IGetMessageFromCache } from '@/chat/interfaces/message.interface';
import { ServerError } from '@/global/helpers/error-handler';
import { Helpers } from '@/global/helpers/helpers';
import { config } from '@/root/config';
import { BaseCache } from '@/service/redis/base.cache';
import Logger from 'bunyan';
import { filter, find, findIndex, reverse } from 'lodash';
const log: Logger = config.createLogger('MessageCache');
export class MessageCache extends BaseCache {
  constructor() {
    super('messageCache');
  }
  private async createConnection(): Promise<void> {
    if (!this.client.isOpen) {
      return this.client.connect();
    }
  }

  public async addChatListToCache(senderId: string, receiverId: string, conversationId: string): Promise<void> {
    try {
      await this.createConnection();
      const userChatList = await this.client.LRANGE(`chatList:${senderId}`, 0, -1);
      if (!userChatList.length) {
        await this.client.RPUSH(`chatList:${senderId}`, JSON.stringify({ receiverId, conversationId }));
      } else {
        const receiverIndex: number = findIndex(userChatList, (item: string) => item.includes(receiverId));

        if (receiverIndex < 0) {
          await this.client.RPUSH(`chatList:${senderId}`, JSON.stringify({ receiverId, conversationId }));
        }
      }
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try Again');
    }
  }

  public async addMessageToCache(conversationId: string, data: IMessageData): Promise<void> {
    try {
      await this.createConnection();
      await this.client.RPUSH(`messages:${conversationId}`, JSON.stringify(data));
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try Again');
    }
  }
  public async addMessageUsersToCache(value: IConversationUsers): Promise<IConversationUsers[]> {
    try {
      await this.createConnection();
      const users: IConversationUsers[] = await this.getMessageUsersList();
      const userIndex: number = findIndex(users, (user) => JSON.stringify(user) === JSON.stringify(value));

      let messageUsers: IConversationUsers[] = [];
      if (userIndex === -1) {
        await this.client.RPUSH('chatUsers', JSON.stringify(value));
        messageUsers = await this.getMessageUsersList();
      } else {
        messageUsers = users;
      }
      return messageUsers;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try Again');
    }
  }
  public async removeMessageUsersFromCache(value: IConversationUsers): Promise<IConversationUsers[]> {
    try {
      await this.createConnection();
      const users: IConversationUsers[] = await this.getMessageUsersList();
      const userIndex: number = findIndex(users, (user) => JSON.stringify(user) === JSON.stringify(value));

      let messageUsers: IConversationUsers[] = [];
      if (userIndex > -1) {
        await this.client.LREM('chatUsers', userIndex, JSON.stringify(value));
        messageUsers = await this.getMessageUsersList();
      } else {
        messageUsers = users;
      }
      return messageUsers;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try Again');
    }
  }

  // Return the all last messages within the all conversation
  public async getUserConversationList(userId: string): Promise<IMessageData[]> {
    try {
      await this.createConnection();
      const userChatList: string[] = await this.client.LRANGE(`chatList:${userId}`, 0, -1);
      const messages: IMessageData[] = [];
      for (const userChat of userChatList) {
        const chatItem: IMessageList = Helpers.parseJson(userChat);
        const lastMessage: string | null = await this.client.LINDEX(`messages:${chatItem.conversationId}`, -1);
        if (!lastMessage) {
          // TODO handle it, if conversation is not found
        } else {
          messages.push(Helpers.parseJson(lastMessage) as IMessageData);
        }
      }
      return messages;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try Again');
    }
  }

  public async getChatMessageList(senderId: string, receiverId: string): Promise<IMessageData[]> {
    try {
      await this.createConnection();
      const chatList: string[] = await this.client.LRANGE(`chatList:${senderId}`, 0, -1);
      const receiverStr: string | undefined = find(chatList, (chat: string) => chat.includes(receiverId));
      const messages: IMessageData[] = [];
      if (!receiverStr) {
        return messages;
      } else {
        const receiver: IMessageList = Helpers.parseJson(receiverStr);
        const messagesStr: string[] = await this.client.LRANGE(`messages:${receiver.conversationId}`, 0, -1);
        for (const messageStr of messagesStr) {
          const message: IMessageData = Helpers.parseJson(messageStr);
          messages.push(message);
        }
      }
      return messages;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try Again');
    }
  }

  async markMessageAsDelete(senderId: string, receiverId: string, messageId: string, type: string): Promise<IMessageData> {
    await this.createConnection();
    const { index, receiver, message: messageStr } = await this.getMessage(senderId, receiverId, messageId);
    let message: IMessageData = Helpers.parseJson(messageStr);
    if (type === 'me') {
      message = {
        ...message,
        deleteForMe: true
      };
    } else {
      message = {
        ...message,
        deleteForMe: true,
        deleteForEveryone: true
      };
    }

    await this.client.LSET(`messages:${receiver.conversationId}`, index, JSON.stringify(message));
    const lastMessageStr: string = (await this.client.LINDEX(`messages:${receiver.conversationId}`, index)) as string;

    return Helpers.parseJson(lastMessageStr) as IMessageData;
  }
  async updateChatMessage(senderId: string, receiverId: string): Promise<IMessageData> {
    await this.createConnection();
    const chatList: string[] = await this.client.LRANGE(`chatList:${senderId}`, 0, -1);
    const receiverStr: string = find(chatList, (chat: string) => chat.includes(receiverId)) as string;
    const receiver: IMessageList = Helpers.parseJson(receiverStr);
    const messagesStr: string[] = await this.client.LRANGE(`messages:${receiver.conversationId}`, 0, -1);
    // const messages: IMessageData[] = [];
    const unreadMessagesStr: string[] = filter(messagesStr, (message: string) => !(Helpers.parseJson(message) as IMessageData).isRead);
    const updatesMessagesPromise: Array<Promise<unknown>> = [];

    messagesStr.reduce((acc: Array<Promise<unknown>>, cur: string, curIndex: number) => {
      const message: IMessageData = Helpers.parseJson(cur);
      // FIXME Message Read if receiverID and Current Logged user id SAME
      if (!message.isRead && message.receiverId === senderId) {
        message.isRead = true;
        acc.push(this.client.LSET(`messages:${receiver.conversationId}`, curIndex, JSON.stringify(message)));
      }
      return acc;
    }, updatesMessagesPromise);

    // Wait for all update promises to complete
    await Promise.all(updatesMessagesPromise);

    // for (const [index, item] of unreadMessagesStr.entries()) {
    //   const unreadMessage: IMessageData = Helpers.parseJson(item);
    //   unreadMessage.isRead = true;
    //   // FIXME Here use orignal array not filtered items array
    //   await this.client.LSET(`messages:${receiver.conversationId}`, index, JSON.stringify(unreadMessage));
    // }

    const lastMessageStr: string = (await this.client.LINDEX(`messages:${receiver.conversationId}`, -1)) as string;

    return Helpers.parseJson(lastMessageStr) as IMessageData;
  }

  private async getMessageUsersList(): Promise<IConversationUsers[]> {
    const chatUsersList: IConversationUsers[] = [];
    const chatUsers = await this.client.LRANGE('chatUsers', 0, -1);
    for (const user of chatUsers) {
      const chatUser: IConversationUsers = Helpers.parseJson(user);
      chatUsersList.push(chatUser);
    }
    return chatUsersList;
  }

  private async getMessage(senderId: string, receiverId: string, messageId: string): Promise<IGetMessageFromCache> {
    await this.createConnection();
    const chatList: string[] = await this.client.LRANGE(`chatList:${senderId}`, 0, -1);
    const receiverStr: string = find(chatList, (chat: string) => chat.includes(receiverId)) as string;
    const receiver: IMessageList = Helpers.parseJson(receiverStr);
    const messages: string[] = await this.client.LRANGE(`messages:${receiver.conversationId}`, 0, -1);
    const messageIndex: number = findIndex(messages, (messageStr) => messageStr.includes(messageId));
    const message: string = messages[messageIndex];
    return {
      index: messageIndex,
      message,
      receiver
    };
  }
}
