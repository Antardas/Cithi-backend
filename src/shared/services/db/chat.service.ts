import { IConversationDocument } from '@/chat/interfaces/conversation.interface';
import { IMessageData, IMessageDocument } from '@/chat/interfaces/message.interface';
import { ConversationModel } from '@/chat/models/conversation.schema';
import { MessageModel } from '@/chat/models/message.schema';
import { IReaction } from '@/reaction/interfaces/reaction.interface';
import { Types } from 'mongoose';

class ChatService {
  async addMessageToDB(data: IMessageData): Promise<void> {
    const {
      _id,
      body,
      conversationId,
      createdAt,
      deleteForEveryone,
      deleteForMe,
      gifUrl,
      isRead,
      reaction,
      receiverAvatarColor,
      receiverId,
      receiverProfilePicture,
      receiverUsername,
      selectedImage,
      senderAvatarColor,
      senderId,
      senderProfilePicture,
      senderUsername
    } = data;
    const conversation: IConversationDocument[] | null = await ConversationModel.findById(data?.conversationId);
    if (!conversation) {
      await ConversationModel.create({
        _id: data.conversationId,
        receiverId: data.receiverId,
        senderId: data.senderId
      });
    }

    await MessageModel.create({
      _id,
      body,
      conversationId,
      createdAt,
      deleteForEveryone,
      deleteForMe,
      gifUrl,
      isRead,
      reaction,
      receiverAvatarColor,
      receiverId,
      receiverProfilePicture,
      receiverUsername,
      selectedImage,
      senderAvatarColor,
      senderId,
      senderProfilePicture,
      senderUsername
    });
  }

  async getUserConversationList(userId: Types.ObjectId): Promise<IMessageData[]> {
    const messages: IMessageData[] = await MessageModel.aggregate([
      {
        $match: {
          $or: [
            {
              senderId: userId
            },
            {
              receiverId: userId
            }
          ]
        }
      },
      {
        $group: {
          _id: 'conversationId',
          message: {
            $last: '$$ROOT'
          }
        }
      },
      {
        $project: {
          _id: '$message._id',
          conversationId: '$message.conversationId',
          receiverId: '$message.receiverId',
          receiverUsername: '$message.receiverUsername',
          receiverAvatarColor: '$message.receiverAvatarColor',
          receiverProfilePicture: '$message.receiverProfilePicture',
          senderUsername: '$message.senderUsername',
          senderId: '$message.senderId',
          senderAvatarColor: '$message.senderAvatarColor',
          senderProfilePicture: '$message.senderProfilePicture',
          body: '$message.body',
          isRead: '$message.isRead',
          gifUrl: '$message.gifUrl',
          selectedImage: '$message.selectedImage',
          reaction: '$message.reaction',
          createdAt: '$message.createdAt',
          deleteForMe: '$message.deleteForMe',
          deleteForEveryone: '$message.deleteForEveryone'
        }
      },
      {
        $sort: {
          createdAt: 1
        }
      }
    ]);

    return messages;
  }

  async getMessages(senderId: Types.ObjectId, receiverId: Types.ObjectId, sort: Record<string, 1 | -1>): Promise<IMessageData[]> {
    const messages: IMessageData[] = await MessageModel.aggregate([
      {
        $match: {
          $or: [
            {
              senderId: senderId,
              receiverId: receiverId
            },
            {
              senderId: receiverId,
              receiverId: senderId
            }
          ]
        }
      },
      {
        $sort: sort
      }
    ]);

    return messages;
  }

  async markMessageAsDeleted(messageId: string, type: 'me' | 'everyone'): Promise<void> {
    interface IDeleteQuery {
      deleteForMe?: boolean;
      deleteForEveryone?: boolean;
    }
    const updateFields: IDeleteQuery = {};
    if (type === 'me') {
      updateFields.deleteForMe = true;
    } else {
      updateFields.deleteForMe = true;
      updateFields.deleteForEveryone = true;
    }
    await MessageModel.findByIdAndUpdate(
      messageId,
      {
        $set: updateFields
      },
      {
        new: true
      }
    );
  }

  async markMessageAsRead(senderId: Types.ObjectId, receiverId: Types.ObjectId): Promise<void> {
    await MessageModel.updateMany(
      {
        // $or: [
        //   {
        //     senderId: senderId,
        //     receiverId: receiverId,
        //     isRead: false
        //   },
        //   {
        //     senderId: receiverId,
        //     receiverId: senderId,
        //     isRead: false
        //   }
        // ]
        senderId: receiverId,
        receiverId: senderId,
        isRead: false
      },
      {
        $set: {
          isRead: true
        }
      }
    );
  }

  async updateMessageReaction(messageId: Types.ObjectId, senderName: string, reaction: string, type: 'add' | 'remove'): Promise<void> {
    if (type === 'add') {
      // await MessageModel.findByIdAndUpdate(messageId, {
      //   $push: {
      //     reaction: {
      //       senderName,
      //       type: reaction
      //     }
      //   }
      // });
      const message: IMessageDocument | null = await MessageModel.findById(messageId);
      if (!message) {
        return;
      }
      const reactions: IReaction[] = message.reaction.filter((item) => item.senderName !== senderName);
      reactions.push({
        senderName,
        type: reaction
      });
      message.reaction = reactions;
      await message.save();
    } else if (type === 'remove') {
      await MessageModel.findByIdAndUpdate(messageId, {
        $pull: {
          reaction: {
            senderName
          }
        }
      });
    }
  }
}
export const chatService: ChatService = new ChatService();
