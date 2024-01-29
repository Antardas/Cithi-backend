import { ServerError } from '@/global/helpers/error-handler';
import { Helpers } from '@/global/helpers/helpers';
import { config } from '@/root/config';
import { BaseCache } from '@/service/redis/base.cache';
import { INotificationSettings, ISocialLinks, IUserDocument } from '@/user/interfaces/user.interface';
import Logger from 'bunyan';
const log: Logger = config.createLogger('UserCache');
type UserItem = string | number | ISocialLinks | INotificationSettings;
export class UserCache extends BaseCache {
  constructor() {
    super('UserCache');
  }

  public async saveUserToCache(key: string, userUId: string, createdUser: IUserDocument): Promise<void> {
    const createdAt = new Date();
    const {
      _id,
      username,
      email,
      avatarColor,
      uId,
      postsCount,
      work,
      school,
      quote,
      location,
      blocked,
      blockedBy,
      followersCount,
      followingCount,
      notifications,
      social,
      bgImageVersion,
      bgImageId,
      profilePicture
    } = createdUser;

    const firstList: string[] = [
      '_id',
      `${_id}`,
      'uId',
      `${uId}`,
      'username',
      `${username}`,
      'email',
      `${email}`,
      'avatarColor',
      `${avatarColor}`,
      'createdAt',
      `${createdAt}`,
      'postsCount',
      `${postsCount}`
    ];

    const secondList: string[] = [
      'blocked',
      `${JSON.stringify(blocked)}`,
      'blockedBy',
      `${JSON.stringify(blockedBy)}`,
      'profilePicture',
      `${profilePicture}`,
      'followersCount',
      `${followersCount}`,
      'followingCount',
      `${followingCount}`,
      'notifications',
      `${JSON.stringify(notifications)}`,
      'social',
      `${JSON.stringify(social)}`
    ];

    const thirdList: string[] = [
      'work',
      `${work}`,
      'location',
      `${location}`,
      'school',
      `${school}`,
      'quote',
      `${quote}`,
      'bgImageVersion',
      `${bgImageVersion}`,
      'bgImageId',
      `${bgImageId}`
    ];

    const dataToSave: string[] = [...firstList, ...secondList, ...thirdList];

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      await this.client.ZADD('user', {
        score: parseInt(userUId, 10),
        value: `${key}`
      });

      await this.client.HSET(`users:${key}`, dataToSave);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try Again!!');
    }
  }

  public async getUserFromCache(userId: string): Promise<IUserDocument | null> {
    try {
      if (!userId) {
        throw new ServerError('userId not Provided');
      }

      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const response: IUserDocument = (await this.client.HGETALL(`users:${userId}`)) as unknown as IUserDocument;

      response.createdAt = new Date(Helpers.parseJson(`${response.createdAt}`));
      response.postsCount = Helpers.parseJson(`${response.postsCount}`);
      response.blocked = Helpers.parseJson(`${response.blocked}`);
      response.blockedBy = Helpers.parseJson(`${response.blockedBy}`);
      response.notifications = Helpers.parseJson(`${response.notifications}`);
      response.social = Helpers.parseJson(String(response.social));
      response.followersCount = Helpers.parseJson(`${response.followersCount}`);
      response.followingCount = Helpers.parseJson(`${response.followingCount}`);
      response.bgImageId = Helpers.parseJson(`${response.bgImageId}`);
      response.bgImageVersion = Helpers.parseJson(`${response.bgImageVersion}`);
      return response;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try Again!!');
    }
  }

  public async updateSingleUserItemInCache(key: string, props: string, value: UserItem): Promise<IUserDocument | null> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      await this.client.HSET(`users:${key}`, `${props}`, JSON.stringify(value));
      const response: IUserDocument | null = await this.getUserFromCache(key);
      return response;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try Again!!');
    }
  }
}
