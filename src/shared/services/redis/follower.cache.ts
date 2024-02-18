import { UserCache } from '@/service/redis/user.cache';
import { IFollowerData } from '@/follower/interfaces/follower.interface';
import { NotFoundError, ServerError } from '@/global/helpers/error-handler';
import { config } from '@/root/config';
import { BaseCache } from '@/service/redis/base.cache';
import Logger from 'bunyan';
import { IUserDocument } from '@/user/interfaces/user.interface';
import mongoose from 'mongoose';
import { Helpers } from '@/global/helpers/helpers';

const log: Logger = config.createLogger('FollowerCache');
const userCache: UserCache = new UserCache();
/**
 * FollowerCache
 *
 * This class is responsible for handling caching operations related to followers in the application.
 * It extends the BaseCache class and implements methods to interact with Redis cache for storing follower-related data.
 */
export class FollowerCache extends BaseCache {
  /**
   * Constructor
   *
   * Initializes the FollowerCache instance by calling the constructor of the BaseCache class.
   */
  constructor() {
    super('followerCache');
  }

  /**
   * createConnection
   *
   * Establishes a connection to the Redis server if one is not already open.
   * This is a private method used internally for connection management.
   *
   * @returns Promise<void>
   */
  private async createConnection(): Promise<void> {
    if (!this.client.isOpen) {
      return this.client.connect();
    }
  }
  /**
   * saveFollowerToCache
   *
   * Saves follower data to the cache with the provided key and value.
   *
   * @param key - The key under which the follower data will be stored.
   * @param value - The value (follower data) to be stored in the cache.
   * @returns Promise<void>
   */
  public async saveFollowerToCache(key: string, value: string): Promise<void> {
    try {
      await this.createConnection();

      await this.client.LPUSH(key, value);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try Again');
    }
  }

  public async removeFollowerFromCache(key: string, value: string): Promise<void> {
    try {
      await this.createConnection();

      await this.client.LREM(key, 1, value);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try Again');
    }
  }
  /**
   * updateFollowerCountInCache
   *
   * Updates the follower count for a user in the cache.
   *
   * @param userId - The ID of the user whose follower count will be updated.
   * @param prop - The property representing the follower count.
   * @param value - The value by which the follower count will be incremented.
   * @returns Promise<void>
   */
  public async updateFollowerCountInCache(userId: string, prop: string, value: number): Promise<void> {
    try {
      await this.createConnection();

      await this.client.HINCRBY(`users:${userId}`, prop, value);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try Again');
    }
  }
  public async getFollowerFromCache(key: string): Promise<IFollowerData[]> {
    try {
      await this.createConnection();
      /**
       * TODO: Sort By Add Recently Followed
       *
       */
      const followersId: string[] = await this.client.LRANGE(key, 0, -1);
      const followers: IFollowerData[] = [];
      for (const followerId of followersId) {
        const user: IUserDocument | null = await userCache.getUserFromCache(followerId);

        if (user) {
          const follower: IFollowerData = {
            _id: new mongoose.Types.ObjectId(user._id),
            uId: user.uId ?? '',
            username: user.username ?? '',
            avatarColor: user.avatarColor ?? '',
            postCount: user.postsCount,
            profilePicture: user.profilePicture,
            followersCount: user.followersCount,
            followingCount: user.followingCount,
            userProfile: user
          };
          followers.push(follower);
        }
      }
      return followers;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try Again');
    }
  }

  public async updateBlockedPropInCache(userId: string, blockUserId: string, prop: string, type: 'block' | 'unblock'): Promise<void> {
    // TODO:  blockedBy need to update
    try {
      await this.createConnection();
      const blockedString: string = (await this.client.HGET(`users:${userId}`, prop)) as string;
      const blocked: string[] = Helpers.parseJson(blockedString);
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();

      if (type === 'block') {
        blocked.push(blockUserId);
      } else {
        const blockUserIndex: number = blocked.findIndex((id) => id === blockUserId);
        if (blockUserIndex === -1) {
          throw new NotFoundError('Block user not found');
        }
        blocked.splice(blockUserIndex, 1);
      }
      multi.HSET(`users:${userId}`, `${prop}`, JSON.stringify(blocked));
      await multi.exec();
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try Again');
    }
  }
}
