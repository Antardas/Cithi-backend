import { ICommentJob, ICommentDocument } from '@/comment/interfaces/comment.interface';
import HTTP_STATUS from 'http-status-codes';
import { ObjectId } from 'mongodb';
import { joiValidation } from '@/global/decorators/joi-validation.decorator';
import { CommentCache } from '@/service/redis/comment.cache';
import { Request, Response } from 'express';
import { addCommentSchema } from '@/comment/schema/comment';
import { ADD_COMMENT_TO_DB, commentQueue } from '@/service/queues/comment.queue';

const commentCache: CommentCache = new CommentCache();

export class Add {
  @joiValidation(addCommentSchema)
  public async comment(req: Request, res: Response): Promise<void> {
    /**
     * [ ] Add to the cache
     * [ ] Add to the job queue
     */

    const { userTo, postId, comment, profilePicture, commentsCount } = req.body;

    const commentObjectId: ObjectId = new ObjectId();

    const commentData: ICommentDocument = {
      _id: commentObjectId,
      postId,
      username: `${req.currentUser?.username}`,
      avatarColor: `${req.currentUser?.avatarColor}`,
      profilePicture,
      comment,
      createdAt: new Date()
    } as ICommentDocument;

    await commentCache.savePostCommentToCache(postId, JSON.stringify(commentData));

    const databaseCommentData: ICommentJob = {
      postId,
      userTo,
      username: `${req.currentUser?.username}`,
      userFrom: `${req.currentUser?.userId}`,

      comment: commentData
    };

    commentQueue.addCommentJob(ADD_COMMENT_TO_DB, databaseCommentData);

    res.status(HTTP_STATUS.CREATED).json({ message: 'Comment added Successfully' });
  }
}
