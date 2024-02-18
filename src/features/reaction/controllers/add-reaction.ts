import { IReactionDocument, IReactionJob } from '@/reaction/interfaces/reaction.interface';
import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { joiValidation } from '@/global/decorators/joi-validation.decorator';
import { addReactionSchema } from '@/reaction/schema/reaction';
import { ReactionCache } from '@/service/redis/reaction.cache';
import { ADD_REACTION_TO_DB, reactionQueue } from '@/service/queues/reaction.queue';

const reactionCache: ReactionCache = new ReactionCache();

export class Add {
  @joiValidation(addReactionSchema)
  public async reaction(req: Request, res: Response): Promise<void> {
    const { userTo, postId, type, previousReaction, postReactions, profilePicture } = req.body;

    const reactionObject: IReactionDocument = {
      _id: new ObjectId(),
      postId,
      type,
      avatarColor: req.currentUser?.avatarColor,
      username: req.currentUser?.username,
      profilePicture
    } as IReactionDocument;

    await reactionCache.savePostReaction(postId, reactionObject, postReactions, type, previousReaction);

    const reaction: IReactionJob = {
      postId,
      userTo,
      userFrom: req.currentUser?.userId,
      username: req.currentUser?.username,
      type,
      previousReaction,
      reactionObject
    } as IReactionJob;

    reactionQueue.addReactionJob(ADD_REACTION_TO_DB, reaction);
    res.status(HTTP_STATUS.OK).json({ message: 'Reaction Added Successfully' });
  }
}

/*-------------------*/
