import { MessageCache } from '@/service/redis/message.cache';
import { IMessageNotification, IConversationUsers } from '@/chat/interfaces/message.interface';
import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { UserCache } from '@/service/redis/user.cache';
import { joiValidation } from '@/global/decorators/joi-validation.decorator';
import { addMessageSchema, markMessageSchema } from '@/chat/schema/message';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { IUserDocument } from '@/user/interfaces/user.interface';
import { UploadApiResponse } from 'cloudinary';
import { uploads } from '@/global/helpers/cloudinary-upload';
import { config } from '@/root/config';
import { BadRequestError } from '@/global/helpers/error-handler';
import { IMessageData } from '@/chat/interfaces/message.interface';
import { socketIOChatObject } from '@/socket/chat';
import { userService } from '@/service/db/user.service';
import { INotificationTemplate } from '@/notification/interfaces/notification.interface';
import { notificationTemplate } from '@/service/emails/notifications/notification-template';
import { RECEIVED_MESSAGE_EMAIL, emailQueue } from '@/service/queues/email.queue';
import { ADD_CHAT_TO_DB, chatQueue } from '@/service/queues/chat.queue';

const userCache: UserCache = new UserCache();
const messageCache: MessageCache = new MessageCache();

export class Add {
  @joiValidation(addMessageSchema)
  public async message(req: Request, res: Response): Promise<void> {
    const {
      conversationId,
      receiverId,
      receiverUsername,
      receiverAvatarColor,
      receiverProfilePicture,
      body = '',
      gifUrl = '',
      selectedImage = '',
      isRead
    } = req.body;
    let fileUrl = '';
    const messageObjectId: ObjectId = new ObjectId();
    const conversationObjectId: ObjectId = conversationId ? new mongoose.Types.ObjectId(conversationId) : new ObjectId();

    const sender: IUserDocument | null = await userCache.getUserFromCache(`${req.currentUser?.userId}`);

    if (selectedImage?.length) {
      const uploadRes: UploadApiResponse = (await uploads(selectedImage, req.currentUser?.userId, true, true)) as UploadApiResponse;
      if (!uploadRes.public_id) {
        throw new BadRequestError(uploadRes.message);
      }
      // Construct URL we need to move it to a utility function
      fileUrl = `https://res.cloudinary.com/${config.CLOUD_NAME}/image/upload/v${uploadRes.version}/${uploadRes.public_id}`;
    }

    const messageData: IMessageData = {
      _id: messageObjectId,
      conversationId: conversationObjectId,
      receiverId,
      receiverUsername,
      receiverAvatarColor,
      receiverProfilePicture,
      senderUsername: `${req.currentUser?.username}`,
      senderId: `${req.currentUser?.userId}`,
      senderAvatarColor: `${req.currentUser?.avatarColor}`,
      senderProfilePicture: `${sender?.profilePicture}`,
      body,
      isRead,
      gifUrl,
      selectedImage: fileUrl,
      reaction: [],
      createdAt: new Date(),
      deleteForMe: false,
      deleteForEveryone: false
    };

    Add.prototype.emitSocketIOEvent(messageData);

    if (!isRead) {
      await Add.prototype.messageNotification({
        currentUser: req.currentUser!,
        receiverName: receiverUsername,
        receiverId: receiverId,
        message: body,
        messageData
      });
    }

    /**
     * TODO add sender to chat list
     * TODO add receiver chat list
     * TODO add message to the cache
     * TODO add message to chat queue
     */
    await messageCache.addChatListToCache(`${req.currentUser?.userId}`, receiverId, conversationObjectId.toString());
    await messageCache.addChatListToCache(receiverId, `${req.currentUser?.userId}`, conversationObjectId.toString());
    await messageCache.addMessageToCache(conversationObjectId.toString(), messageData);
    chatQueue.addChatJob(ADD_CHAT_TO_DB, messageData);

    res.status(HTTP_STATUS.OK).json({
      message: 'Message added',
      data: {
        conversationId: conversationObjectId.toString(),
        messageId: messageObjectId.toString()
      }
    });
  }
  @joiValidation(markMessageSchema)
  public async addMessageUsers(req: Request, res: Response): Promise<void> {
    const { receiver, sender } = req.body;
    const chatUsers: IConversationUsers[] = await messageCache.addMessageUsersToCache({
      receiver,
      sender
    });
    socketIOChatObject.emit('ADD_MESSAGE_USER', chatUsers);
    res.status(HTTP_STATUS.OK).json({
      message: 'Users Added'
    });
  }
  @joiValidation(markMessageSchema)
  public async removeMessageUsers(req: Request, res: Response): Promise<void> {
    const { receiver, sender } = req.body;
    const chatUsers: IConversationUsers[] = await messageCache.removeMessageUsersFromCache({
      receiver,
      sender
    });
    socketIOChatObject.emit('REMOVE_MESSAGE_USER', chatUsers);
    res.status(HTTP_STATUS.OK).json({
      message: 'Users removed'
    });
  }

  private emitSocketIOEvent(data: IMessageData): void {
    socketIOChatObject.emit('MESSAGE_RECEIVED', data);
    socketIOChatObject.emit('CHAT_LIST', data);
  }

  private async messageNotification({ currentUser, message, receiverName, receiverId }: IMessageNotification): Promise<void> {
    let sender: IUserDocument | null = await userCache.getUserFromCache(receiverId);
    if (!sender) {
      sender = await userService.getUserById(receiverId);
    }

    if (sender.notifications.messages) {
      const templateParams: INotificationTemplate = {
        username: receiverName,
        message,
        header: `Message notification from ${currentUser.username}`
      };
      const template: string = notificationTemplate.notificationMessageTemplate(templateParams);
      emailQueue.addEmailJob(RECEIVED_MESSAGE_EMAIL, {
        template,
        subject: `You've received message from ${currentUser.username}`,
        receiverEmail: currentUser.email
      });
    }
  }
}
