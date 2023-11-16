import { Remove } from '@/reaction/controllers/remove-reaction';
import { authUserPayload } from '@/root/mocks/auth.mock';
import { reactionMockRequest, reactionMockResponse } from '@/root/mocks/reaction.mock';
import { REMOVE_REACTION_FROM_DB, reactionQueue } from '@/service/queues/reaction.queue';
import { ReactionCache } from '@/service/redis/reaction.cache';
import { Request, Response } from 'express';
jest.mock('@/service/redis/reaction.cache');
jest.mock('@/service/queues/base.queue');
describe('RemoveReaction', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });
  it('should send correct json response', async () => {
    const req: Request = reactionMockRequest({}, {}, authUserPayload, {
      postId: '6027f77087c9d9ccb1555268',
      previousReaction: 'like',
      postReactions: JSON.stringify({
        like: 1,
        love: 0,
        wow: 0,
        sad: 0,
        angry: 0,
        haha: 0
      })
    }) as Request;
    jest.spyOn(ReactionCache.prototype, 'removePostReaction');
    jest.spyOn(reactionQueue, 'addReactionJob');
    const res: Response = reactionMockResponse();
    await Remove.prototype.reaction(req, res);
    const { postId, previousReaction, postReactions } = req.params;
    expect(ReactionCache.prototype.removePostReaction).toHaveBeenCalledWith(
      req.params.postId,
      authUserPayload.username,
      JSON.parse(req.params.postReactions)
    );
    expect(reactionQueue.addReactionJob).toHaveBeenCalledWith(REMOVE_REACTION_FROM_DB, {
      postId,
      username: req.currentUser!.username,
      previousReaction
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Reaction remove from post'
    });
  });
});

//
