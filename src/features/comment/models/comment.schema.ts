import { ICommentDocument } from '@/comment/interfaces/comment.interface';
import mongoose, { Model, Schema } from 'mongoose';

const commentSchema: Schema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    index: true,
    require: true
  },
  comment: {
    type: String,
    default: ''
  },
  username: {
    type: String
  },
  avatarColor: {
    type: String
  },
  profilePicture: {
    type: String
  },
  createdAt: {
    type: String
  }
});

const CommentModel: Model<ICommentDocument> = mongoose.model<ICommentDocument>('Comment', commentSchema);
export { CommentModel };
//
