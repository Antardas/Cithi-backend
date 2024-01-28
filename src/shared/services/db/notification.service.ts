import { INotificationDocument } from '@/notification/interfaces/notification.interface';
import { NotificationModel } from '@/notification/models/notification.schema';
import mongoose from 'mongoose';

class NotificationService {
  async getNotifications(userId: string): Promise<INotificationDocument[]> {
    const notifications: INotificationDocument[] = await NotificationModel.aggregate([
      {
        $match: {
          userTo: new mongoose.Types.ObjectId(userId)
        }
      },
      {
        $lookup: {
          from: 'User',
          localField: 'userFrom',
          foreignField: '_id',
          as: 'userForm'
        }
      },
      {
        $unwind: '$userForm'
      },
      {
        $lookup: {
          from: 'Auth',
          foreignField: '_id',
          localField: 'userFrom.authId',
          as: 'authId'
        }
      },
      {
        $unwind: '$authId'
      },
      {
        $project: {
          _id: 1,
          message: 1,
          comment: 1,
          createdAt: 1,
          createdItemId: 1,
          entityId: 1,
          notificationType: 1,
          gifUrl: 1,
          imgId: 1,
          imgVersion: 1,
          post: 1,
          reaction: 1,
          read: 1,
          userTo: 1,
          userFrom: {
            profilePicture: '$userFrom.profilePicture',
            username: '$authId.username',
            avatarColor: '$authId.avatarColor',
            uId: '$authId.uId'
          }
        }
      }
    ]);
    return notifications;
  }

  async updateRead(notificationId: string): Promise<void> {
    await NotificationModel.findByIdAndUpdate(notificationId, {
      $set: {
        read: true
      }
    });
  }

  async delete(notificationId: string): Promise<void> {
    await NotificationModel.findByIdAndDelete(notificationId);
  }
}
const notificationService: NotificationService = new NotificationService();
export { notificationService };
