import { ICommentJob } from '@/comment/interfaces/comment.interface';
import { BaseQueue } from '@/service/queues/base.queue';
import { commentWorker } from '@/worker/comment.worker';

export const ADD_COMMENT_TO_DB: string = 'ADD_COMMENT_TO_DB';

class CommentQueue extends BaseQueue {
  constructor() {
    super('comments');
    this.processJob(ADD_COMMENT_TO_DB, 5, commentWorker.addCommentToDB);
  }

  public addCommentJob(name: string, data: ICommentJob): void {
    this.addJob(name, data);
  }
}

export const commentQueue: CommentQueue = new CommentQueue();
//
