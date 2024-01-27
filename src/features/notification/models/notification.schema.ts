import mongoose, { Model, Schema } from 'mongoose';
import { INotification, INotificationDocument } from '@/notification/interfaces/notification.interface';
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
const NotificationModel: Model<INotificationDocument> = mongoose.model<INotificationDocument>('Notification', notificationSchema);

export { NotificationModel };
