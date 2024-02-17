import HTTP_STATUS from 'http-status-codes';
import { joiValidation } from '@/global/decorators/joi-validation.decorator';
import { UPDATE_POST_IN_DB, postQueue } from '@/service/queues/post.queue';
import { PostCache } from '@/service/redis/post.cache';
import { socketIOPostObject } from '@/socket/post';
import { Request, Response } from 'express';
import { postSchema, postWithImageSchema, postWithVideoSchema } from '@/post/schema/post.schema';
import { IPostDocument } from '@/post/interfaces/post.interface';
import { UploadApiResponse } from 'cloudinary';
import { uploads, videoUpload } from '@/global/helpers/cloudinary-upload';
import { BadRequestError } from '@/global/helpers/error-handler';
import { ADD_IMAGE_TO_DB, imageQueue } from '@/service/queues/image.queue';
const postCache: PostCache = new PostCache();
export class Update {
  @joiValidation(postSchema)
  public async post(req: Request, res: Response): Promise<void> {
    const { post, bgColor, feelings, privacy, gifUrl, imgId, imgVersion, profilePicture, videoId, videoVersion } = req.body;
    const { postId } = req.params;
    const updatedPost: IPostDocument = {
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      imgId,
      imgVersion,
      profilePicture,
      videoId,
      videoVersion
    } as IPostDocument;
    const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);
    socketIOPostObject.emit('update post', postUpdated, 'posts');

    postQueue.addPostJob(UPDATE_POST_IN_DB, { key: postId, value: updatedPost });

    res.status(HTTP_STATUS.OK).json({ message: 'Post updated successfully' });
  }
  @joiValidation(postWithImageSchema)
  public async postWithImage(req: Request, res: Response): Promise<void> {
    // if imageId and imgVersion is exist it's point that user is not updating image
    const { imgId, imgVersion } = req.body;
    if (imgId && imgVersion) {
      await Update.prototype.updatePost(req);
    } else {
      const result: UploadApiResponse = await Update.prototype.addFileToExistingPost(req);
      if (!result?.public_id) {
        throw new BadRequestError(result.message);
      }
    }
    res.status(HTTP_STATUS.OK).json({ message: 'Post updated successfully' });
  }
  @joiValidation(postWithVideoSchema)
  public async postWithVideo(req: Request, res: Response): Promise<void> {
    // if imageId and imgVersion is exist it's point that user is not updating video

    const { videoId, videoVersion } = req.body;
    if (videoId && videoVersion) {
      await Update.prototype.updatePost(req);
    } else {
      const result: UploadApiResponse = await Update.prototype.addFileToExistingPost(req);
      if (!result?.public_id) {
        throw new BadRequestError(result.message);
      }
    }
    res.status(HTTP_STATUS.OK).json({ message: 'Post updated successfully' });
  }

  private async updatePost(req: Request): Promise<void> {
    const { post, bgColor, feelings, privacy, gifUrl, imgId, imgVersion, profilePicture, videoId, videoVersion } = req.body;
    const { postId } = req.params;
    const updatedPost: IPostDocument = {
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      imgId: imgId ? imgId : '',
      imgVersion: imgVersion ? imgVersion : '',
      profilePicture,
      videoId: videoId ? videoId : '',
      videoVersion: videoVersion ? videoVersion : ''
    } as IPostDocument;
    const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);
    socketIOPostObject.emit('update post', postUpdated, 'posts');

    postQueue.addPostJob(UPDATE_POST_IN_DB, { key: postId, value: updatedPost });
  }

  private async addFileToExistingPost(req: Request): Promise<UploadApiResponse> {
    const { post, bgColor, feelings, privacy, gifUrl, image, profilePicture, video } = req.body;
    const { postId } = req.params;
    const result: UploadApiResponse = image ? ((await uploads(image)) as UploadApiResponse) : ((await videoUpload(video)) as UploadApiResponse);
    if (!result?.public_id) {
      return result;
    }

    const updatedPost: IPostDocument = {
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      profilePicture,
      imgId: image ? result.public_id : '',
      imgVersion: image ? result.version.toString() : '',
      videoId: video ? result.public_id : '',
      videoVersion: video ? result.version.toString() : ''
    } as IPostDocument;
    const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);
    socketIOPostObject.emit('update post', postUpdated, 'posts');

    postQueue.addPostJob(UPDATE_POST_IN_DB, { key: postId, value: updatedPost });
    // call image queue to add image to database

    if (image) {
      imageQueue.addImageJob(ADD_IMAGE_TO_DB, {
        key: req.currentUser?.userId,
        imageId: result.public_id,
        imgVersion: result.version.toString()
      });
    }

    return result;
  }
}
