import { UserCache } from '@/service/redis/user.cache';
import { IQueryReaction, IReactionDocument, IReactionJob } from '@/reaction/interfaces/reaction.interface';
import { ReactionModel } from '@/reaction/models/reaction.schema';
import { PostModel } from '@/post/model/post.model';
import { IUserDocument } from '@/user/interfaces/user.interface';
import { IPostDocument } from '@/post/interfaces/post.interface';
import { omit } from 'lodash';
import mongoose from 'mongoose';
import { Helpers } from '@/global/helpers/helpers';

const userCache: UserCache = new UserCache();
class ReactionService {
  public async addReactionToDB(reactionData: IReactionJob): Promise<void> {
    const { postId, username, previousReaction, userTo, userFrom, type, reactionObject } = reactionData;
    let updatedReactionObject: IReactionDocument = reactionObject as IReactionDocument;
    if (previousReaction) {
      updatedReactionObject = omit(reactionObject, ['_id']);
    }
    try {
      const updateReaction: [IUserDocument | null, IReactionDocument, IPostDocument] = (await Promise.all([
        userCache.getUserFromCache(`${userTo}`),
        ReactionModel.replaceOne(
          {
            postId,
            type: previousReaction,
            username
          },
          updatedReactionObject,
          {
            upsert: true
          }
        ),
        PostModel.findOneAndUpdate(
          {
            _id: postId
          },
          {
            $inc: {
              [`reactions.${previousReaction}`]: -1,
              [`reactions.${type}`]: 1
            }
          },
          {
            new: true
          }
        )
      ])) as unknown as [IUserDocument | null, IReactionDocument, IPostDocument];
      // updateReaction;
      console.log(updateReaction);
    } catch (error) {
      console.log(error);
    }

    // TODO: Send Notification to user
  }

  public async removeReactionFromDB(reactionData: IReactionJob): Promise<void> {
    const { postId, username, previousReaction } = reactionData;
    await Promise.all([
      ReactionModel.deleteOne({
        postId,
        type: previousReaction,
        username
      }),
      PostModel.updateOne(
        {
          _id: postId
        },
        {
          $inc: {
            [`reactions.${previousReaction}`]: -1
          }
        }
      )
    ]);
  }

  public async getPostReactions(query: IQueryReaction, sort: Record<string, 1 | -1>): Promise<[IReactionDocument[], number]> {
    const reactions: IReactionDocument[] = await ReactionModel.aggregate([
      {
        $match: query
      },
      {
        $sort: sort
      }
    ]);
    return reactions.length ? [reactions, reactions.length] : [[], 0];
  }

  public async getSinglePostReactionByUsername(postId: string, username: string): Promise<[IReactionDocument, number] | []> {
    const reaction: IReactionDocument[] = await ReactionModel.aggregate([
      {
        $match: {
          postId: new mongoose.Types.ObjectId(postId),
          username: Helpers.firstLatterUpperCase(username)
        }
      }
    ]);

    return reaction.length ? [reaction[0], 1] : [];
  }
  public async getReactionsByUsername(username: string): Promise<IReactionDocument[]> {
    const reactions: IReactionDocument[] = await ReactionModel.aggregate([
      {
        $match: {
          username: Helpers.firstLatterUpperCase(username)
        }
      }
    ]);

    return reactions;
  }
}

const reactionService: ReactionService = new ReactionService();

export { reactionService };
//
