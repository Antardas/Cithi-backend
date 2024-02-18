import { Add } from '@/comment/controllers/add-comment';
import { authUserPayload } from '@/root/mocks/auth.mock';
import { reactionMockRequest, reactionMockResponse } from '@/root/mocks/reaction.mock';
import { existingUser } from '@/root/mocks/user.mock';
import { commentQueue } from '@/service/queues/comment.queue';
import { CommentCache } from '@/service/redis/comment.cache';
import { Request, Response } from 'express';
jest.useFakeTimers();
jest.mock('@/service/queues/base.queue');
jest.mock('@/service/redis/comment.cache');

describe('Add', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should call savePostCommentToCache and  addCommentJob methods', async () => {
    const req: Request = reactionMockRequest(
      {},
      {
        postId: '6027f77087c9d9ccb1555268',
        comment: 'This is a comment',
        profilePicture: 'https://place-hold.it/500x500',
        userTo: `${existingUser._id}`
      },
      authUserPayload
    ) as Request;
    const res: Response = reactionMockResponse();

    jest.spyOn(CommentCache.prototype, 'savePostCommentToCache');
    jest.spyOn(commentQueue, 'addCommentJob');

    await Add.prototype.comment(req, res);
    expect(CommentCache.prototype.savePostCommentToCache).toHaveBeenCalled();
    expect(commentQueue.addCommentJob).toHaveBeenCalled();
  });

  it('should send correct json response', async () => {
    const req: Request = reactionMockRequest(
      {},
      {
        postId: '6027f77087c9d9ccb1555268',
        comment: 'This is a comment',
        profilePicture: 'https://place-hold.it/500x500',
        userTo: `${existingUser._id}`
      },
      authUserPayload
    ) as Request;
    const res: Response = reactionMockResponse();

    await Add.prototype.comment(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Comment added Successfully'
    });
  });
});
