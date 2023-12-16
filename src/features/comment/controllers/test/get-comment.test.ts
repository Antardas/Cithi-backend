import { Get } from '@/comment/controllers/get-comment';
import { reactionMockResponse, reactionMockRequest, commentsData, commentNames } from '@/root/mocks/reaction.mock';
import { authUserPayload } from '@/root/mocks/auth.mock';
import { Request, Response } from 'express';
import { CommentCache } from '@/service/redis/comment.cache';
import { commentService } from '@/service/db/comment.service';
import mongoose from 'mongoose';
import { ICommentDocument } from '@/comment/interfaces/comment.interface';

describe('Get', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('comments', () => {
    it('should send correct json response if comments exist in cache', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268'
      }) as Request;

      const res: Response = reactionMockResponse();

      jest.spyOn(CommentCache.prototype, 'getPostCommentFromCache').mockResolvedValue([commentsData]);
      await Get.prototype.comments(req, res);
      expect(CommentCache.prototype.getPostCommentFromCache).toHaveBeenCalledWith('6027f77087c9d9ccb1555268');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Retrieve Comments successfully',
        comments: [commentsData]
      });
    });

    it('should send correct json response if comments exist in database', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268'
      }) as Request;

      const res: Response = reactionMockResponse();

      jest.spyOn(CommentCache.prototype, 'getPostCommentFromCache').mockResolvedValue([]);
      jest.spyOn(commentService, 'getPostComments').mockResolvedValue([commentsData]);
      await Get.prototype.comments(req, res);
      expect(CommentCache.prototype.getPostCommentFromCache).toHaveBeenCalledWith('6027f77087c9d9ccb1555268');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Retrieve Comments successfully',
        comments: [commentsData]
      });
    });
	});

  describe('commentNames', () => {
    it('should send correct json response if comments exist in cache', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268'
      }) as Request;

      const res: Response = reactionMockResponse();

      jest.spyOn(CommentCache.prototype, 'getCommentNamesFromCache').mockResolvedValue(commentNames);
      await Get.prototype.commentNames(req, res);
      expect(CommentCache.prototype.getCommentNamesFromCache).toHaveBeenCalledWith('6027f77087c9d9ccb1555268');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Retrieve Comment Names successfully',
        comments: commentNames
      });
    });

    it('should send correct json response if comments exist in database', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268'
      }) as Request;

      const res: Response = reactionMockResponse();

      jest.spyOn(CommentCache.prototype, 'getCommentNamesFromCache').mockResolvedValue({
        count: 0,
        names: []
      });
      jest.spyOn(commentService, 'getPostCommentNames').mockResolvedValue(commentNames);
      await Get.prototype.commentNames(req, res);
      expect(CommentCache.prototype.getCommentNamesFromCache).toHaveBeenCalledWith('6027f77087c9d9ccb1555268');
      expect(commentService.getPostCommentNames).toHaveBeenCalledWith(
        {
          postId: new mongoose.Types.ObjectId('6027f77087c9d9ccb1555268')
        },
        {
          createdAt: -1
        }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Retrieve Comment Names successfully',
        comments: commentNames
      });
    });
  });


  describe('singleComment', () => {
    it('should send correct json response if comments exist in cache', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268',
        commentId: '6064861bc25eaa5a5d2f9bf4'
      }) as Request;

      const res: Response = reactionMockResponse();

      jest.spyOn(CommentCache.prototype, 'getSingleCommentFromCache').mockResolvedValue(commentsData);
      await Get.prototype.singleComment(req, res);
      expect(CommentCache.prototype.getSingleCommentFromCache).toHaveBeenCalledWith('6027f77087c9d9ccb1555268', '6064861bc25eaa5a5d2f9bf4');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Retrieve Comment successfully',
        comment: commentsData
      });
    });

    it('should send correct json response if comments exist in database', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268',
        commentId: '6064861bc25eaa5a5d2f9bf4'
      }) as Request;

      const res: Response = reactionMockResponse();

      jest.spyOn(CommentCache.prototype, 'getSingleCommentFromCache').mockResolvedValue({} as ICommentDocument);
      jest.spyOn(commentService, 'getSingleComment').mockResolvedValue(commentsData);
      await Get.prototype.singleComment(req, res);
      expect(CommentCache.prototype.getSingleCommentFromCache).toHaveBeenCalledWith('6027f77087c9d9ccb1555268', '6064861bc25eaa5a5d2f9bf4');
      expect(commentService.getSingleComment).toHaveBeenCalledWith('6064861bc25eaa5a5d2f9bf4');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Retrieve Comment successfully',
        comment: commentsData
      });
    });
  });
});
