import { ServerError } from '@/global/helpers/error-handler';
import { Helpers } from '@/global/helpers/helpers';
import { IReaction, IReactionDocument, IReactions } from '@/reaction/interfaces/reaction.interface';
import { config } from '@/root/config';
import { find } from 'lodash';
import { BaseCache } from '@/service/redis/base.cache';
import Logger from 'bunyan';

const log: Logger = config.createLogger('ReactionCache');
const REACTION_kEY_PREFIX: string = 'reactions';
export class ReactionCache extends BaseCache {
  constructor() {
    super('ReactionCache');
  }

  private async createConnection(): Promise<void> {
    if (!this.client.isOpen) {
      return this.client.connect();
    }
  }

  public async savePostReaction(
    key: string,
    reaction: IReactionDocument,
    postReactions: IReactions,
    type: string,
    previousReaction: string
  ): Promise<void> {
    try {
      await this.createConnection();

      if (previousReaction) {
        this.removePostReaction(key, reaction.username, postReactions);
      }

      if (type) {
        await this.client.LPUSH(`${REACTION_kEY_PREFIX}:${key}`, JSON.stringify(reaction));
        const dataToSave: string[] = ['reactions', JSON.stringify(postReactions)];
        await this.client.HSET(`posts:${key}`, dataToSave);
      }
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try Again');
    }
  }
  public async removePostReaction(key: string, username: string, reaction: IReactions): Promise<void> {
    try {
      await this.createConnection();
      const response: string[] = await this.client.LRANGE(`${REACTION_kEY_PREFIX}:${key}`, 0, -1);
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      const userPreviousReaction: IReactionDocument = this.getPreviousReaction(response, username) as IReactionDocument;
      multi.LREM(`${REACTION_kEY_PREFIX}:${key}`, 1, JSON.stringify(userPreviousReaction));
      await multi.exec();
      const dataToSave: string[] = ['reactions', JSON.stringify(reaction)];
      await this.client.HSET(`posts:${key}`, dataToSave);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try Again');
    }
  }

  public async getReactions(postId: string): Promise<[IReactionDocument[], number]> {
    try {
      await this.createConnection();

      const reactionCount: number = await this.client.LLEN(`reactions:${postId}`);
      const response: string[] = await this.client.LRANGE(`reactions:${postId}`, 0, -1);
      const list: IReactionDocument[] = [];
      for (const item of response) {
        list.push(Helpers.praseJson(item) as IReactionDocument);
      }
      return response.length ? [list, reactionCount] : [[], 0];
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try Again');
    }
  }
  public async getSingleReactionByUsername(postId: string, username: string): Promise<[IReactionDocument, number] | []> {
    try {
      await this.createConnection();

      const response: string[] = await this.client.LRANGE(`reactions:${postId}`, 0, -1);
      const list: IReactionDocument[] = [];
      //BUG: we can also check or find it when "Parse to Json"
      for (const item of response) {
        list.push(Helpers.praseJson(item) as IReactionDocument);
      }
      const result: IReactionDocument = find(list, (listItem: IReactionDocument) => {
        return listItem.postId === postId && listItem.username === username;
      }) as IReactionDocument;
      return response.length ? [result, 1] : [];

    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try Again');
    }
  }

  private getPreviousReaction(response: string[], username: string): IReactionDocument | undefined {
    const list: IReactionDocument[] = [];
    response.forEach((item) => {
      list.push(Helpers.praseJson(item));
    });

    return find(list, (listItem: IReactionDocument) => {
      return listItem.username === username;
    });
  }
}
