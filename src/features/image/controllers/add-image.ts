import HTTP_STATUS from 'http-status-codes';
import { joiValidation } from '@/global/decorators/joi-validation.decorator';
import { Request, Response } from 'express';
import { addImageSchema } from '@/image/schema/image';
import { UserCache } from '@/service/redis/user.cache';
import { UploadApiResponse } from 'cloudinary';
import { uploads } from '@/global/helpers/cloudinary-upload';
import { BadRequestError } from '@/global/helpers/error-handler';
import { config } from '@/root/config';
import { IUserDocument } from '@/user/interfaces/user.interface';
import { socketIOImageObject } from '@/socket/image';
import { ADD_USER_PROFILE_IMAGE_TO_DB, UPDATE_BACKGROUND_IMAGE_IN_BD, imageQueue } from '@/service/queues/image.queue';
import { IBgUploadResponse } from '@/image/interfaces/image.interface';
import { Helpers } from '@/global/helpers/helpers';
const userCache: UserCache = new UserCache();

export class Add {
  @joiValidation(addImageSchema)
  public async profileImage(req: Request, res: Response): Promise<void> {
    const result: UploadApiResponse = (await uploads(req.body.image, req.currentUser?.userId, true, true)) as UploadApiResponse;
    if (!result.public_id) {
      throw new BadRequestError('File Upload : Error Occurred Try again');
    }
    const url: string = `https://res.cloudinary.com/${config.CLOUD_NAME}/image/upload/v${result.version}/${result.public_id}`;
    const updatedCachedUser: IUserDocument | null = await userCache.updateSingleUserItemInCache(`${req.currentUser?.userId}`, 'profilePicture', url);
    socketIOImageObject.emit('UPDATE_PROFILE_IMAGE', updatedCachedUser);

    imageQueue.addImageJob(ADD_USER_PROFILE_IMAGE_TO_DB, {
      key: req.currentUser?.userId,
      value: url,
      imgId: result.public_id,
      imgVersion: result.version.toString()
    });

    res.status(HTTP_STATUS.OK).json({
      message: 'Update the user profile',
      data: url
    });
  }

  @joiValidation(addImageSchema)
  public async backgroundImage(req: Request, res: Response): Promise<void> {
    const { version, publicId }: IBgUploadResponse = await Add.prototype.backgroundUpload(req.body.image);
    const bgImageIdCacheUser: Promise<IUserDocument | null> = userCache.updateSingleUserItemInCache(
      `${req.currentUser?.userId}`,
      'bgImageId',
      publicId
    );

    const updatedCachedUser: Promise<IUserDocument | null> = userCache.updateSingleUserItemInCache(
      `${req.currentUser?.userId}`,
      'bgImageVersion',
      version
    );
    await Promise.all([bgImageIdCacheUser, updatedCachedUser]);
    socketIOImageObject.emit('UPDATE_BACKGROUND_IMAGE', {
      bgImageId: publicId,
      bgImageVersion: version,
      userId: req.currentUser?.userId
    });

    imageQueue.addImageJob(UPDATE_BACKGROUND_IMAGE_IN_BD, {
      key: req.currentUser?.userId,
      imgId: publicId,
      imgVersion: version.toString()
    });

    res.status(HTTP_STATUS.OK).json({
      message: 'Update the user profile'
    });
  }

  private async backgroundUpload(image: string): Promise<IBgUploadResponse> {
    const isDataUrl = Helpers.isDataUrl(image);
    let version = '',
      publicId = '';
    if (isDataUrl) {
      const result: UploadApiResponse = (await uploads(image)) as UploadApiResponse;
      if (!result.public_id) {
        throw new BadRequestError(result.message);
      } else {
        publicId = result.public_id;
        version = result.version.toString();
      }
    } else {
      const urlArr = image.split('/');
      publicId = urlArr.pop() ?? '';
      version = urlArr.pop()?.replace(/v/g, '') ?? '';
    }

    return {
      publicId,
      version
    };
  }
}
