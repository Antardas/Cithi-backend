import { IMessageDocument } from '@/chat/interfaces/message.interface';
import mongoose, { Model, Schema, model } from 'mongoose';

const messageSchema: Schema = new Schema({
  conversationId: { type: mongoose.Types.ObjectId, ref: 'Conversation' },
  senderId: { type: mongoose.Types.ObjectId, ref: 'User' },
  receiverId: { type: mongoose.Types.ObjectId, ref: 'User' },
  senderUsername: { type: String, default: '' },
  senderProfilePicture: { type: String, default: '' },
  senderAvatarColor: { type: String, default: '' },
  receiverUsername: { type: String, default: '' },
  receiverProfilePicture: { type: String, default: '' },
  receiverAvatarColor: { type: String, default: '' },
  body: { type: String, default: '' },
  gifUrl: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
  deleteForMe: { type: Boolean, default: false },
  deleteForEveryone: { type: Boolean, default: false },
  selectedImage: { type: String, default: '' },
  reaction: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now }
});

const MessageModel: Model<IMessageDocument> = model<IMessageDocument>('Message', messageSchema);

export { MessageModel };
