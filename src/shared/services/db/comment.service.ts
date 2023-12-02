/* eslint-disable @typescript-eslint/no-unused-vars */ // NOTE: remove this line
import { Query } from 'mongoose';
import { UserCache } from '@/service/redis/user.cache';
import { ICommentDocument, ICommentJob, ICommentNameList, IQueryComment } from '@/comment/interfaces/comment.interface';
import { CommentModel } from '@/comment/models/comment.schema';
import { IPostDocument } from '@/post/interfaces/post.interface';
import { PostModel } from '@/post/model/post.model';
import { IUserDocument } from '@/user/interfaces/user.interface';

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

    const user: Promise<IUserDocument> = userCache.getUserFromCache(userTo) as Promise<IUserDocument>;

    const response: [ICommentDocument, IPostDocument, IUserDocument] = await Promise.all([comments, post, user]);

    // TODO:  send notification to the post owner
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
}

export const commentService: CommentService = new CommentService();

//
