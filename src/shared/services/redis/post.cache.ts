import { ServerError } from '@/global/helpers/error-handler';
import { Helpers } from '@/global/helpers/helpers';
import { IPostDocument, IPostSaveToCache, IReaction } from '@/post/interfaces/post.interface';
import { config } from '@/root/config';
import { BaseCache } from '@/service/redis/base.cache';
import Logger from 'bunyan';
import { RedisCommandRawReply } from '@redis/client/dist/lib/commands';

const log: Logger = config.createLogger('postCache');

export type PostCacheMultiType = string | number | Buffer | RedisCommandRawReply[] | IPostDocument | IPostDocument[];

export class PostCache extends BaseCache {
  constructor() {
    super('postCache');
  }

  public async savePostToCache(data: IPostSaveToCache): Promise<void> {
    const { key, currentUserId, uId, createdPost } = data;
    const {
      _id,
      userId,
      username,
      email,
      avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      commentCount,
      imgVersion,
      imgId,
      reactions,
      createAt
    } = createdPost;

    const firstList: Array<string> = [
      '_id',
      `${_id}`,
      'userId',
      `${userId}`,
      'username',
      `${username}`,
      'email',
      `${email}`,
      'avatarColor',
      `${avatarColor}`,
      'profilePicture',
      `${profilePicture}`,
      'post',
      `${post}`,
      'bgColor',
      `${bgColor}`,
      'feelings',
      `${feelings}`,
      'privacy',
      `${privacy}`,
      'gifUrl',
      `${gifUrl}`
    ];

    const secondList: Array<string> = [
      'commentCount',
      `${commentCount}`,
      'reactions',
      `${JSON.stringify(reactions)}`,
      'imgVersion',
      `${imgVersion}`,
      'imgId',
      `${imgId}`,
      'createAt',
      `${createAt}`
    ];

    const dataToSave: Array<string> = [...firstList, ...secondList];
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const postCount: string[] = await this.client.HMGET(`users:${currentUserId}`, 'postsCount');
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      multi.ZADD('post', {
        score: parseInt(uId, 10),
        value: `${key}`
      });
      multi.HSET(`posts:${key}`, dataToSave);

      const count: number = parseInt(postCount[0], 10) + 1;
      multi.HSET(`users:${currentUserId}`, ['postsCount', count]);
      await multi.exec();
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try Again!!');
    }
  }

  public async getPostsFromCache(key: string, start: number, end: number): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const reply: string[] = await this.client.ZRANGE(key, start, end, { REV: true });
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();

      for (const value of reply) {
        multi.HGETALL(`posts:${value}`);
      }

      const replies: PostCacheMultiType = (await multi.exec()) as PostCacheMultiType;
      const postReplies: IPostDocument[] = [];

      for (const post of replies as IPostDocument[]) {
        post.commentCount = Helpers.praseJson(`${post.commentCount}`) as number;
        post.reactions = Helpers.praseJson(`${post.reactions}`) as IReaction;
        post.createAt = new Date(Helpers.praseJson(`${post.createAt}`));
        postReplies.push(post);
      }

      log.info(reply);
      return postReplies;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try Again!!');
    }
  }

  public async getTotalPostNumberInCache(): Promise<number> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const count: number = await this.client.ZCARD('post');
      return count;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try Again!!');
    }
  }

  public async getPostsWithImagesFromCache(key: string, start: number, end: number): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const reply: string[] = await this.client.ZRANGE(key, start, end, { REV: true });
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();

      for (const value of reply) {
        multi.HGETALL(`posts:${value}`);
      }

      const replies: PostCacheMultiType = (await multi.exec()) as PostCacheMultiType;
      const postWithImagesReplies: IPostDocument[] = [];

      for (const post of replies as IPostDocument[]) {
        if ((post.imgId && post.imgVersion) || post.gifUrl) {
          post.commentCount = Helpers.praseJson(`${post.commentCount}`) as number;
          post.reactions = Helpers.praseJson(`${post.reactions}`) as IReaction;
          post.createAt = new Date(Helpers.praseJson(`${post.createAt}`));
          postWithImagesReplies.push(post);
        }
      }

      log.info(reply);
      return postWithImagesReplies;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try Again!!');
    }
  }
  public async getUserPostsFromCache(key: string, uId: number): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const reply: string[] = await this.client.ZRANGE(key, uId, uId, { REV: true, BY: 'SCORE' });
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();

      for (const value of reply) {
        multi.HGETALL(`posts:${value}`);
      }

      const replies: PostCacheMultiType = (await multi.exec()) as PostCacheMultiType;
      const postReplies: IPostDocument[] = [];

      for (const post of replies as IPostDocument[]) {
        post.commentCount = Helpers.praseJson(`${post.commentCount}`) as number;
        post.reactions = Helpers.praseJson(`${post.reactions}`) as IReaction;
        post.createAt = new Date(Helpers.praseJson(`${post.createAt}`));
        postReplies.push(post);
      }

      log.info(reply);
      return postReplies;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try Again!!');
    }
  }

  public async getTotalPostSingleUserInCache(uId: number): Promise<number> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const count: number = await this.client.ZCOUNT('post', uId, uId);
      return count;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try Again!!');
    }
  }
}
