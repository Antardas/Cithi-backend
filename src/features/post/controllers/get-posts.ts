import { IPostDocument } from '@/post/interfaces/post.interface';
import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { PostCache } from '@/service/redis/post.cache';
import { postService } from '@/service/db/post.service';

const postCache: PostCache = new PostCache();
const PAGE_SIZE = 10;
export class Get {
  public async posts(req: Request, res: Response): Promise<void> {
    const { page } = req.params;
    const skip: number = (parseInt(page, 10) - 1) * PAGE_SIZE;
    const limit: number = PAGE_SIZE * parseInt(page, 10);
    const newSkip: number = skip === 0 ? skip : skip + 1;
    let posts: IPostDocument[] = [];
    let totalPost = 0;
    const cachedPost: IPostDocument[] = await postCache.getPostsFromCache('post', newSkip, limit);
    if (cachedPost.length) {
      posts = cachedPost;
      totalPost = await postCache.getTotalPostNumberInCache();
    } else {
      posts = await postService.getPosts({}, skip, limit, {
        createdAt: -1
      });
      totalPost = await postService.postCount();
    }

    res.status(HTTP_STATUS.OK).json({
      message: 'All Post',
      posts,
      totalPost
    });
  }

  public async postsWithImages(req: Request, res: Response): Promise<void> {
    const { page } = req.params;
    const skip: number = (parseInt(page, 10) - 1) * PAGE_SIZE;
    const limit: number = PAGE_SIZE * parseInt(page, 10);
    const newSkip: number = skip === 0 ? skip : skip + 1;
    let posts: IPostDocument[] = [];

    const cachedPost: IPostDocument[] = await postCache.getPostsWithImagesFromCache('post', newSkip, limit);
    console.log(cachedPost);
    posts = cachedPost.length
      ? cachedPost
      : await postService.getPosts(
          {
            imgId: '$ne',
            gifUrl: '$ne'
          },
          skip,
          limit,
          {
            createdAt: -1
          }
        );
    res.status(HTTP_STATUS.OK).json({
      message: 'All Post with images',
      posts
    });
  }
}
