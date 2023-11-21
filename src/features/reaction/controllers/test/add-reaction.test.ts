import { Request, Response } from 'express';
import { CustomError } from '@/global/helpers/error-handler';
import { Add } from '@/reaction/controllers/add-reaction';
import { authUserPayload } from '@/root/mocks/auth.mock';
import { reactionMockRequest, reactionMockResponse } from '@/root/mocks/reaction.mock';
import { reactionQueue } from '@/service/queues/reaction.queue';
import { ReactionCache } from '@/service/redis/reaction.cache';
jest.mock('@/service/queues/base.queue');
jest.mock('@/service/redis/reaction.cache');
describe('AddReaction', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should throw error if postId is not exist', async () => {
    const req: Request = reactionMockRequest(
      {},
      {
        // postId: '6027f77087c9d9ccb1555268',
        previousReaction: 'love',
        profilePicture: 'http://place-hold.it/500x500',
        userTo: '60263f14648fed5246e322d9',
        type: 'like',
        postReactions: {
          like: 1,
          love: 0,
          wow: 0,
          sad: 0,
          angry: 0,
          haha: 0
        }
      },
      authUserPayload
    ) as Request;
    const res: Response = reactionMockResponse();

    try {
      await Add.prototype.reaction(req, res);
      fail('Expected an error to be thrown');
    } catch (err) {
      const customError = err as CustomError;
      expect(customError.message).toBe('postId is required property');
      expect(customError.statusCode).toBe(400);
    }
  });

  it('should throw error if type is not exist', async () => {
    const req: Request = reactionMockRequest(
      {},
      {
        postId: '6027f77087c9d9ccb1555268',
        previousReaction: 'love',
        profilePicture: 'http://place-hold.it/500x500',
        userTo: '60263f14648fed5246e322d9',
        // type: 'like',
        postReactions: {
          like: 1,
          love: 0,
          wow: 0,
          sad: 0,
          angry: 0,
          haha: 0
        }
      },
      authUserPayload
    ) as Request;
    const res: Response = reactionMockResponse();

    try {
      await Add.prototype.reaction(req, res);
      // If the code reaches here, it means the test failed because an error was expected
      fail('Expected an error to be thrown');
    } catch (err) {
      const customError = err as CustomError;
      expect(customError.message).toBe('type is required property');
      expect(customError.statusCode).toBe(400);
    }
  });

  it('should send correct json response', async () => {
    const req: Request = reactionMockRequest(
      {},
      {
        postId: '6027f77087c9d9ccb1555268',
        previousReaction: 'love',
        profilePicture: 'http://place-hold.it/500x500',
        userTo: '60263f14648fed5246e322d9',
        type: 'like',
        postReactions: {
          like: 1,
          love: 0,
          wow: 0,
          sad: 0,
          angry: 0,
          haha: 0
        }
      },
      authUserPayload
    ) as Request;
    const res: Response = reactionMockResponse();
    const spy = jest.spyOn(ReactionCache.prototype, 'savePostReaction');
    const reactionSpy = jest.spyOn(reactionQueue, 'addReactionJob');

    await Add.prototype.reaction(req, res);
    expect(ReactionCache.prototype.savePostReaction).toHaveBeenCalledWith(
      spy.mock.calls[0][0],
      spy.mock.calls[0][1],
      spy.mock.calls[0][2],
      spy.mock.calls[0][3],
      spy.mock.calls[0][4]
    );
    expect(reactionQueue.addReactionJob).toHaveBeenCalledWith(reactionSpy.mock.calls[0][0], reactionSpy.mock.calls[0][1]);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Reaction Added Successfully'
    });
  });
});

//
