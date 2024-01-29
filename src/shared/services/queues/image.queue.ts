import { IFileImageJobData } from '@/image/interfaces/image.interface';
import { BaseQueue } from '@/service/queues/base.queue';
import { imageWorker } from '@/worker/image.worker';

export const ADD_IMAGE_TO_DB: string = 'ADD_IMAGE_TO_DB';
export const ADD_USER_PROFILE_IMAGE_TO_DB: string = 'ADD_USER_PROFILE_IMAGE_TO_DB';
export const UPDATE_IMAGE_IN_BD: string = 'UPDATE_IMAGE_IN_BD';
export const REMOVE_IMAGE_FROM_DB: string = 'REMOVE_IMAGE_FROM_DB';

class ImageQueue extends BaseQueue {
  constructor() {
    super('Image');
    this.processJob(ADD_IMAGE_TO_DB, 5, imageWorker.addImageToDB);
    this.processJob(ADD_USER_PROFILE_IMAGE_TO_DB, 5, imageWorker.addUserProfileImageToDB);
    this.processJob(UPDATE_IMAGE_IN_BD, 5, imageWorker.updateBgImageInDB);
    this.processJob(REMOVE_IMAGE_FROM_DB, 5, imageWorker.removeImageFromDB);
  }

  addImageJob(name: string, data: IFileImageJobData): void {
    this.addJob(name, data);
  }
}

export const imageQueue: ImageQueue = new ImageQueue();
