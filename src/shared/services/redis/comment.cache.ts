import { config } from '@/root/config';
import Logger from 'bunyan';
import { BaseCache } from './base.cache';
import { ServerError } from '@/global/helpers/error-handler';
import { Helpers } from '@/global/helpers/helpers';
import { ICommentDocument, ICommentNameList } from '@/comment/interfaces/comment.interface';

const log: Logger = config.createLogger('CommentCache');

export class CommentCache extends BaseCache {
  constructor() {
    super('CommentCache');
    log.info();
  }

  private async createConnection(): Promise<void> {
    if (!this.client.isOpen) {
      return this.client.connect();
    }
  }

  /*
  TODO: Create
  TODO: Update
  TODO: Delete
  */

  public async savePostCommentToCache(postId: string, value: string): Promise<void> {
    try {
      await this.createConnection();

      await this.client.LPUSH(`comments:${postId}`, value);
      const commentCount: string[] = await this.client.HMGET(`posts:${postId}`, 'commentCount');
      let count: number = Helpers.parseJson(commentCount[0]) as number;
      count += 1;
      const dataToSave: string[] = ['commentCount', `${count}`];
      await this.client.HSET(`posts:${postId}`, dataToSave);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try Again');
    }
  }

  public async getPostCommentFromCache(postId: string): Promise<ICommentDocument[]> {
    // TODO: Implement pagination
    try {
      await this.createConnection();

      const reply: string[] = await this.client.LRANGE(`comments:${postId}`, 0, -1);

      const list: ICommentDocument[] = [];
      for (const item of reply) {
        list.push(Helpers.parseJson(item));
      }
      return list;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try Again');
    }
  }

  public async getCommentNamesFromCache(postId: string): Promise<ICommentNameList> {
    try {
      await this.createConnection();

      const commentCount: number = await this.client.LLEN(`comments:${postId}`);
      const comments: string[] = await this.client.LRANGE(`comments:${postId}`, 0, -1);
      const list: string[] = comments.map((item) => {
        const comment: ICommentDocument = Helpers.parseJson(item) as ICommentDocument;
        return comment.username;
      });

      return {
        count: commentCount,
        names: list
      };
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try Again');
    }
  }

  public async getSingleCommentFromCache(postId: string, commentId: string): Promise<ICommentDocument> {
    // TODO: Implement pagination
    try {
      await this.createConnection();

      const comments: string[] = await this.client.LRANGE(`comments:${postId}`, 0, -1);
      const commentString: string | undefined = comments.find((item: string) => {
        const comment: ICommentDocument = Helpers.parseJson(item) as ICommentDocument;
        return comment._id === commentId;
      });

      return Helpers.parseJson(commentString || '') as ICommentDocument;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try Again');
    }
  }
}
//
