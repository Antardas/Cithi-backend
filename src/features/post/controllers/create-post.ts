import { UploadApiResponse } from 'cloudinary';
import { IPostDocument } from '@/post/interfaces/post.interface';
import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { joiValidation } from '@/global/decorators/joi-validation.decorator';
import { ObjectId } from 'mongodb';
import { postSchema, postWithImageSchema } from '@/post/schema/post.schema';
import { PostCache } from '@/service/redis/post.cache';
import { socketIOPostObject } from '@/socket/post';
import { ADD_POST_TO_DB, postQueue } from '@/service/queues/post.queue';
import { uploads } from '@/global/helpers/cloudinary-upload';
import { BadRequestError } from '@/global/helpers/error-handler';
import { ADD_IMAGE_TO_DB, imageQueue } from '@/service/queues/image.queue';

const postCache: PostCache = new PostCache();

export class Create {
  @joiValidation(postSchema)
  public async post(req: Request, res: Response): Promise<void> {
    const { post, bgColor, privacy, gifUrl, profilePicture, feelings } = req.body;

    const postObjectId: ObjectId = new ObjectId();
    const newPostObj: IPostDocument = {
      _id: postObjectId,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      avatarColor: req.currentUser!.avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      commentCount: 0,
      imgVersion: '',
      imgId: '',
      createAt: new Date(),
      reactions: {
        angry: 0,
        like: 0,
        love: 0,
        happy: 0,
        sad: 0,
        wow: 0
      }
    } as IPostDocument;

    socketIOPostObject.emit('addPost', newPostObj);
    await postCache.savePostToCache({
      key: postObjectId,
      createdPost: newPostObj,
      currentUserId: `${req.currentUser!.userId}`,
      uId: `${req.currentUser!.uId}`
    });

    postQueue.addPostJob(ADD_POST_TO_DB, {
      key: req.currentUser?.userId,
      value: newPostObj
    });

    res.status(HTTP_STATUS.CREATED).json({
      message: 'Post Create Successfully'
    });
  }
  @joiValidation(postWithImageSchema)
  public async postWithImage(req: Request, res: Response): Promise<void> {
    const { post, bgColor, privacy, gifUrl, profilePicture, feelings, image } = req.body;

    const result: UploadApiResponse = (await uploads(image)) as UploadApiResponse;
    if (!result?.public_id) {
      throw new BadRequestError(result.message);
    }

    const postObjectId: ObjectId = new ObjectId();
    const newPostObj: IPostDocument = {
      _id: postObjectId,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      avatarColor: req.currentUser!.avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      commentCount: 0,
      imgVersion: result.version.toString(),
      imgId: result.public_id,
      createAt: new Date(),
      reactions: {
        angry: 0,
        like: 0,
        love: 0,
        happy: 0,
        sad: 0,
        wow: 0
      }
    } as IPostDocument;

    socketIOPostObject.emit('addPost', newPostObj);

    await postCache.savePostToCache({
      key: postObjectId,
      createdPost: newPostObj,
      currentUserId: `${req.currentUser!.userId}`,
      uId: `${req.currentUser!.uId}`
    });

    postQueue.addPostJob(ADD_POST_TO_DB, {
      key: req.currentUser?.userId,
      value: newPostObj
    });
    // TODO: call image queue to add mongoDB
    imageQueue.addImageJob(ADD_IMAGE_TO_DB, {
      key: req.currentUser?.userId,
      imageId: result.public_id,
      imgVersion: result.version.toString()
    });

    res.status(HTTP_STATUS.CREATED).json({
      message: 'Post Created with image Successfully'
    });
  }
}
