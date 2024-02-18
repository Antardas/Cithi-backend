import { ICommentNameList } from '@/comment/interfaces/comment.interface';
import { ICommentDocument } from './../interfaces/comment.interface';
import HTTP_STATUS from 'http-status-codes';
import { CommentCache } from '@/service/redis/comment.cache';
import { Request, Response } from 'express';
import { commentService } from '@/service/db/comment.service';
import mongoose from 'mongoose';
import { isEmpty } from 'lodash';


const commentCache: CommentCache = new CommentCache();
export class Get {
  public async comments(req: Request, res: Response) {
    const { postId } = req.params;

    const cachedComments: ICommentDocument[] = await commentCache.getPostCommentFromCache(postId);
    let comments: ICommentDocument[] = [];
    if (!cachedComments.length) {
      comments = await commentService.getPostComments(
        {
          postId: new mongoose.Types.ObjectId(postId)
        },
        {
          createdAt: -1
        }
      );
    } else {
      comments = cachedComments;
    }

    res.status(HTTP_STATUS.OK).json({
      message: 'Retrieve Comments successfully',
      comments
    });
  }

  public async commentNames(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;

    const cachedCommentsNames: ICommentNameList = await commentCache.getCommentNamesFromCache(postId);
    let commentNames: ICommentNameList;
    if (!cachedCommentsNames.count) {
      commentNames = await commentService.getPostCommentNames(
        {
          postId: new mongoose.Types.ObjectId(postId)
        },
        {
          createdAt: -1
        }
      );
    } else {
      commentNames = cachedCommentsNames;
    }

    res.status(HTTP_STATUS.OK).json({
      message: 'Retrieve Comment Names successfully',
      comments: commentNames
    });
  }

  public async singleComment(req: Request, res: Response): Promise<void> {
    const { postId, commentId } = req.params;

    let comment: ICommentDocument  = await commentCache.getSingleCommentFromCache(postId, commentId);
    if (isEmpty(comment)) {
      comment = await commentService.getSingleComment(commentId) as ICommentDocument;
    }

    res.status(HTTP_STATUS.OK).json({
      message: 'Retrieve Comment successfully',
      comment
    });
  }
}
