import { ServerError } from '@/global/helpers/error-handler';
import { config } from '@/root/config';
import { BaseCache } from '@/service/redis/base.cache';
import Logger from 'bunyan';

const log: Logger = config.createLogger('FollowerCache');

export class FollowerCache extends BaseCache {
  constructor() {
    super('followerCache');
  }

  private async createConnection(): Promise<void> {
    if (!this.client.isOpen) {
      return this.client.connect();
    }
  }

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

  public async updateFollowerCountInCache(userId: string, prop: string, value: number): Promise<void> {
    try {
      await this.createConnection();

      await this.client.HINCRBY(`users:${userId}`, prop, value);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try Again');
    }
  }
}
