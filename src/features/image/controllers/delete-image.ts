import { IFileImageDocument } from '@/image/interfaces/image.interface';
import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { socketIOImageObject } from '@/socket/image';
import { REMOVE_IMAGE_FROM_DB, imageQueue } from '@/service/queues/image.queue';
import { imageService } from '@/service/db/image.service';
import { UserCache } from '@/service/redis/user.cache';
import { IUserDocument } from '@/user/interfaces/user.interface';
const userCache: UserCache = new UserCache();
export class Delete {
  public async image(req: Request, res: Response): Promise<void> {
    const { imageId } = req.params;
    socketIOImageObject.emit('DELETE_IMAGE', imageId);
    imageQueue.addImageJob(REMOVE_IMAGE_FROM_DB, {
      imgId: imageId
    });
    res.status(HTTP_STATUS.OK).json({
      message: 'Image Deleted successfully'
    });
  }
  public async backgroundImage(req: Request, res: Response): Promise<void> {
    const { imageId } = req.params;
    const image: IFileImageDocument = (await imageService.getImageByBackgroundId(imageId)) as IFileImageDocument;
    const bgImageIdCacheUser: Promise<IUserDocument | null> = userCache.updateSingleUserItemInCache(`${req.currentUser?.userId}`, 'bgImageId', '');

    const updatedCachedUser: Promise<IUserDocument | null> = userCache.updateSingleUserItemInCache(
      `${req.currentUser?.userId}`,
      'bgImageVersion',
      ''
    );

    await Promise.all([bgImageIdCacheUser, updatedCachedUser]);
    socketIOImageObject.emit('DELETE_IMAGE', image._id);
    imageQueue.addImageJob(REMOVE_IMAGE_FROM_DB, {
      imgId: image._id
    });
    res.status(HTTP_STATUS.OK).json({
      message: 'Image Deleted successfully'
    });
  }
}
