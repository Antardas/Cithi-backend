import { notificationTemplate } from '@/service/emails/notifications/notification-template';
/* eslint-disable @typescript-eslint/no-unused-vars */ // NOTE: remove this line
import mongoose, { ObjectId, Query } from 'mongoose';
import { UserCache } from '@/service/redis/user.cache';
import { ICommentDocument, ICommentJob, ICommentNameList, IQueryComment } from '@/comment/interfaces/comment.interface';
import { CommentModel } from '@/comment/models/comment.schema';
import { IPostDocument } from '@/post/interfaces/post.interface';
import { PostModel } from '@/post/model/post.model';
import { IUserDocument } from '@/user/interfaces/user.interface';
import { INotificationDocument, INotificationTemplate } from '@/notification/interfaces/notification.interface';
import { NotificationModel } from '@/notification/models/notification.schema';
import { socketIONotificationObject } from '@/socket/notification';
import { COMMENT_EMAIL, emailQueue } from '../queues/email.queue';

const userCache: UserCache = new UserCache();

class CommentService {
  public async addCommentToDB(commentData: ICommentJob): Promise<void> {
    const { postId, userTo, userFrom, comment, username } = commentData;

    const comments: Promise<ICommentDocument> = CommentModel.create(comment);
    const post: Query<IPostDocument, IPostDocument> = PostModel.findByIdAndUpdate(
      postId,
      {
        $inc: {
          commentCount: 1
        }
      },
      { new: true }
    ) as Query<IPostDocument, IPostDocument>;

    // TODO: handle if userCache not exist
    const userPromise: Promise<IUserDocument> = userCache.getUserFromCache(userTo) as Promise<IUserDocument>;

    const response: [ICommentDocument, IPostDocument, IUserDocument] = await Promise.all([comments, post, userPromise]);

    //   send notification to the post owner
    const user: IUserDocument = response[2];

    if (user.notifications.comments && userFrom !== userTo) {
      const notificationDoc: INotificationDocument = new NotificationModel();
      const notifications = await notificationDoc.insertNotification({
        userFrom,
        userTo,
        message: `${username} commented on your post.`,
        notificationType: 'comment',
        entityId: new mongoose.Types.ObjectId(postId),
        createdItemId: new mongoose.Types.ObjectId(response[0]._id),
        createdAt: new Date(),
        comment: comment.comment,
        post: response[1].post,
        imgId: response[1]?.imgId ?? '',
        imgVersion: response[1]?.imgVersion ?? '',
        gifUrl: response[1]?.gifUrl ?? '',
        reaction: ''
      });

      socketIONotificationObject.emit('INSERT_NOTIFICATION', notifications, { userTo });
      const templateParams: INotificationTemplate = {
        username: user.username ?? '',
        header: 'Comment Notification',
        message: `${username} commented on your post.`
      };

      const template: string = notificationTemplate.notificationMessageTemplate(templateParams);

      emailQueue.addEmailJob(COMMENT_EMAIL, {
        receiverEmail: user.email ?? '',
        subject: 'Post notification',
        template
      });
    }
  }

  public async getPostComments(query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentDocument[]> {
    const comments: ICommentDocument[] = await CommentModel.aggregate([
      {
        $match: query
      },
      {
        $sort: sort
      }
    ]);

    return comments;
  }

  public async getPostCommentNames(query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentNameList> {
    //TODO: Return only Each name once
    const commentsNamesList: ICommentNameList[] = await CommentModel.aggregate([
      {
        $match: query
      },
      {
        $sort: sort
      },
      {
        $group: {
          _id: null,
          names: {
            $addToSet: '$username'
          },
          count: {
            $sum: 1
          }
        }
      },
      {
        $project: {
          $_id: 0
        }
      }
    ]);
    if (commentsNamesList.length) {
      return commentsNamesList[0];
    } else {
      return {} as ICommentNameList;
    }
  }

  public async getSingleComment(commentId: string | ObjectId): Promise<ICommentDocument | null> {
    return await CommentModel.findById(commentId);
  }
}

export const commentService: CommentService = new CommentService();

//
