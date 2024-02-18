import { config } from '@/root/config';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { imageService } from '@/service/db/image.service';
const log: Logger = config.createLogger('ImageWorker');
class ImageWorker {
  async addUserProfileImageToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value, imgId, imgVersion, imageId } = job.data;
      await imageService.addUserProfileImageToDB(key, value, imgId, imgVersion);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async updateBgImageInDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, imgId, imgVersion } = job.data;
      await imageService.addBackgroundImageToDB(key, imgId, imgVersion);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async addImageToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, imgId, imgVersion } = job.data;
      await imageService.addImage(key, imgId, imgVersion, '');
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async removeImageFromDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { imgId } = job.data;
      await imageService.removeImageFromDB(imgId);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const imageWorker: ImageWorker = new ImageWorker();
