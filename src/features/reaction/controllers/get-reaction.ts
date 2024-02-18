import { Request, Response } from 'express';
import mongoose from 'mongoose';
import HTTP_STATUS from 'http-status-codes';
import { IReactionDocument } from '@/reaction/interfaces/reaction.interface';
import { reactionService } from '@/service/db/reaction.service';
import { ReactionCache } from '@/service/redis/reaction.cache';

const reactionCache = new ReactionCache();
export class Get {
  public async reactions(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const cachedReactions: [IReactionDocument[], number] = await reactionCache.getReactions(postId);

    const reactions: [IReactionDocument[], number] = cachedReactions[0].length
      ? cachedReactions
      : await reactionService.getPostReactions(
          {
            postId: new mongoose.Types.ObjectId(postId)
          },
          {
            createdAt: -1
          }
        );

    res.status(HTTP_STATUS.OK).json({
      message: 'Post Reactions',
      reactions: reactions[0],
      count: reactions[1]
    });
  }

  public async getSinglePostReactionByUsername(req: Request, res: Response): Promise<void> {
    const { postId, username } = req.params;
    const cachedReactions: [IReactionDocument, number] | [] = await reactionCache.getSinglePostReactionByUsername(postId, username);

    const reactions: [IReactionDocument, number] | [] = cachedReactions.length
      ? cachedReactions
      : await reactionService.getSinglePostReactionByUsername(postId, username);

    res.status(HTTP_STATUS.OK).json({
      message: 'Single post reaction by username',
      reactions: reactions.length ? reactions[0] : {},
      count: reactions.length ? reactions[1] : 0
    });
  }
  public async getReactionsByUsername(req: Request, res: Response): Promise<void> {
    const { username } = req.params;
    const reactions: IReactionDocument[] = await reactionService.getReactionsByUsername(username);
    res.status(HTTP_STATUS.OK).json({
      message: 'All reactions by username',
      reactions: reactions,
      count: reactions.length
    });
  }
}
//
