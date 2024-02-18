import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';

import { IReactionJob } from '@/reaction/interfaces/reaction.interface';
import { Helpers } from '@/global/helpers/helpers';
import { REMOVE_REACTION_FROM_DB, reactionQueue } from '@/service/queues/reaction.queue';
import { ReactionCache } from '@/service/redis/reaction.cache';

const reactionCache: ReactionCache = new ReactionCache();

export class Remove {
  public async reaction(req: Request, res: Response): Promise<void> {
    const { postId, previousReaction, postReactions  } = req.params;
    const username = `${req.currentUser?.username}`;
    await reactionCache.removePostReaction(postId, username, JSON.parse(postReactions));
    const reactionJobData: IReactionJob = {
      postId,
      username,
      previousReaction
    };

    reactionQueue.addReactionJob(REMOVE_REACTION_FROM_DB, reactionJobData);
    res.status(HTTP_STATUS.OK).json({
      message: 'Reaction remove from post'
    });

  }
}

//
