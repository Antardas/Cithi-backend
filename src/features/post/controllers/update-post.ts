import HTTP_STATUS from 'http-status-codes';
import { joiValidation } from '@/global/decorators/joi-validation.decorator';
import { UPDATE_POST_IN_DB, postQueue } from '@/service/queues/post.queue';
import { PostCache } from '@/service/redis/post.cache';
import { socketIOPostObject } from '@/socket/post';
import { Request, Response } from 'express';
import { postSchema, postWithImageSchema } from '@/post/schema/post.schema';
import { IPostDocument } from '@/post/interfaces/post.interface';
import { UploadApiResponse } from 'cloudinary';
import { uploads } from '@/global/helpers/cloudinary-upload';
import { BadRequestError } from '@/global/helpers/error-handler';
const postCache: PostCache = new PostCache();
export class Update {
  @joiValidation(postSchema)
  public async post(req: Request, res: Response): Promise<void> {
    const { post, bgColor, feelings, privacy, gifUrl, imgId, imgVersion, profilePicture } = req.body;
    const { postId } = req.params;
    const updatedPost: IPostDocument = { post, bgColor, feelings, privacy, gifUrl, imgId, imgVersion, profilePicture } as IPostDocument;
    const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);
    socketIOPostObject.emit('update post', postUpdated, 'posts');

    postQueue.addPostJob(UPDATE_POST_IN_DB, { key: postId, value: updatedPost });

    res.status(HTTP_STATUS.OK).json({ message: 'Post updated successfully' });
  }
  @joiValidation(postWithImageSchema)
  public async postWithImage(req: Request, res: Response): Promise<void> {
    const { imgId, imgVersion } = req.body;
    if (imgId && imgVersion) {
      await Update.prototype.updatePostWithImage(req);
    } else {
      const result: UploadApiResponse = await Update.prototype.addImageToExistingPost(req);
      if (!result?.public_id) {
        throw new BadRequestError(result.message);
      }
    }
    res.status(HTTP_STATUS.OK).json({ message: 'Post updated successfully' });
  }

  private async updatePostWithImage(req: Request): Promise<void> {
    const { post, bgColor, feelings, privacy, gifUrl, imgId, imgVersion, profilePicture } = req.body;
    const { postId } = req.params;
    const updatedPost: IPostDocument = { post, bgColor, feelings, privacy, gifUrl, imgId, imgVersion, profilePicture } as IPostDocument;
    const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);
    socketIOPostObject.emit('update post', postUpdated, 'posts');

    postQueue.addPostJob(UPDATE_POST_IN_DB, { key: postId, value: updatedPost });
  }

  private async addImageToExistingPost(req: Request): Promise<UploadApiResponse> {
    const { post, bgColor, feelings, privacy, gifUrl, image, profilePicture } = req.body;
    const { postId } = req.params;
    const result: UploadApiResponse = (await uploads(image)) as UploadApiResponse;
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
      imgId: result.public_id,
      imgVersion: result.version.toString()
    } as IPostDocument;
    const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);
    socketIOPostObject.emit('update post', postUpdated, 'posts');

    postQueue.addPostJob(UPDATE_POST_IN_DB, { key: postId, value: updatedPost });
    // call image queue to add image to database

    return result;
  }
}
