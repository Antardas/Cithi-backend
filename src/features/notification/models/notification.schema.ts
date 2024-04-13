import mongoose, { Model, Schema } from 'mongoose';
import { INotification, INotificationDocument } from '@/notification/interfaces/notification.interface';
import { notificationService } from '@/service/db/notification.service';

const notificationSchema: Schema = new Schema({
  userTo: { type: mongoose.Types.ObjectId, ref: 'User', index: true },
  userFrom: { type: mongoose.Types.ObjectId, ref: 'User' },
  read: { type: Boolean, default: false },
  message: { type: String, default: '' },
  notificationType: { type: String, default: '' },
  entityId: mongoose.Types.ObjectId,
  createdItemId: mongoose.Types.ObjectId,
  comment: { type: String, default: '' },
  reaction: { type: String, default: '' },
  post: { type: String, default: '' },
  imgId: { type: String, default: '' },
  imageVersion: { type: String, default: '' },
  gifUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now() }
});

notificationSchema.methods.insertNotification = async (body: INotification) => {
  const { userFrom, userTo, message, notificationType, entityId, createdItemId, createdAt, comment, reaction, post, imgId, imgVersion, gifUrl } =
    body;

  try {
    await NotificationModel.create({
      userFrom,
      userTo,
      message,
      notificationType,
      entityId,
      createdItemId,
      createdAt,
      comment,
      reaction,
      post,
      imgId,
      imgVersion,
      gifUrl
    });

    const notifications: INotificationDocument[] = await notificationService.getNotifications(userTo);
    return notifications;
  } catch (error) {
    console.log(error);
  }
};

const NotificationModel: Model<INotificationDocument> = mongoose.model<INotificationDocument>('Notification', notificationSchema);

export { NotificationModel };
