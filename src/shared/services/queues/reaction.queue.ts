import { IReactionJob } from '@/reaction/interfaces/reaction.interface';
import { BaseQueue } from '@/service/queues/base.queue';
import { reactionWorker } from '@/worker/reaction.worker';
export const ADD_REACTION_TO_DB: string = 'ADD_REACTION_TO_DB';
export const REMOVE_REACTION_FROM_DB: string = 'REMOVE_REACTION_FROM_DB';
class ReactionQueue extends BaseQueue {
  constructor() {
    super('reaction');
    this.processJob(ADD_REACTION_TO_DB, 5, reactionWorker.addReactionToDB);
    this.processJob(REMOVE_REACTION_FROM_DB, 5, reactionWorker.removeReactionFromDB);
  }

  public addReactionJob(name: string, data: IReactionJob) {
    this.addJob(name, data);
  }
}
export const reactionQueue: ReactionQueue = new ReactionQueue();
