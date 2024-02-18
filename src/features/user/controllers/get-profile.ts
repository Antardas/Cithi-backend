import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { IAllUsers, IUserDocument } from '@/user/interfaces/user.interface';
import { IFollowerData } from '@/follower/interfaces/follower.interface';
import mongoose from 'mongoose';
import { Helpers } from '@/global/helpers/helpers';
import { IPostDocument } from '@/post/interfaces/post.interface';
import { FollowerCache } from '@/service/redis/follower.cache';
import { PostCache } from '@/service/redis/post.cache';
import { UserCache } from '@/service/redis/user.cache';
import { postService } from '@/service/db/post.service';
import { userService } from '@/service/db/user.service';
import { followerService } from '@/service/db/follower.service';

const userCache: UserCache = new UserCache();
const postCache: PostCache = new PostCache();
const followerCache: FollowerCache = new FollowerCache();

interface IUserAll {
  newSkip: number;
  limit: number;
  skip: number;
  userId: string;
}

const PAGE_SIZE: number = 12;
export class Get {
  public async all(req: Request, res: Response): Promise<void> {
    const { page = '1' } = req.query as { page: string };
    const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
    const limit: number = PAGE_SIZE * parseInt(page);
    const start: number = skip === 0 ? skip : skip + 1;
    const userId: string = `${req.currentUser?.userId}`;
    const allUsers = await Get.prototype.allUsers({
      newSkip: start,
      limit,
      userId,
      skip
    });
    const followers: IFollowerData[] = await Get.prototype.followers(userId);
    res.status(HTTP_STATUS.OK).json({
      message: 'Get users',
      data: {
        users: allUsers.users,
        totalUser: allUsers.totalUsers,
        followers
      }
    });
  }

  public async profile(req: Request, res: Response): Promise<void> {
    const cachedUser: IUserDocument | null = await userCache.getUserFromCache(`${req.currentUser?.userId}`);
    const user: IUserDocument = cachedUser ? cachedUser : await userService.getUserById(`${req.currentUser?.userId}`);
    res.status(200).json({
      message: 'user profile',
      data: user
    });
  }

  public async profileUserId(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const cachedUser: IUserDocument | null = await userCache.getUserFromCache(id);
    const user: IUserDocument = cachedUser ? cachedUser : await userService.getUserById(id);
    res.status(200).json({
      message: 'user profile by id',
      data: user
    });
  }

  public async profileAndPost(req: Request, res: Response): Promise<void> {
    const { id, username, uId } = req.params;
    const userName: string = Helpers.firstLatterUpperCase(username);
    const cachedUser: IUserDocument | null = await userCache.getUserFromCache(id);
    const cachedUserPost: IPostDocument[] = await postCache.getUserPostsFromCache('post', parseInt(uId, 10));
    const user: IUserDocument = cachedUser ? cachedUser : await userService.getUserById(id);
    const userPost: IPostDocument[] = cachedUserPost.length
      ? cachedUserPost
      : await postService.getPosts({ username: userName }, 0, 100, { createdAt: -1 });

    res.status(200).json({
      message: 'user profile and posts',
      data: {
        posts: userPost,
        user
      }
    });
  }

  public async randomUsersSuggestion(req: Request, res: Response): Promise<void> {
    let cachedUsers: IUserDocument[] = await userCache.getRandomUsersFromCache(`${req.currentUser?.userId}`, `${req.currentUser?.username}`);
    cachedUsers = cachedUsers?.length ? cachedUsers : await userService.getRandomUsers(`${req.currentUser?.userId}`);

    res.status(200).json({
      message: 'user suggestions',
      data: cachedUsers
    });
  }

  private async allUsers({ newSkip, limit, skip, userId }: IUserAll): Promise<IAllUsers> {
    let users;
    let type: 'redis' | 'mongoDB';
    const cachedUser: IUserDocument[] = await userCache.getUsersFromCache(newSkip, limit, userId);
    if (cachedUser.length) {
      type = 'redis';
      users = cachedUser;
    } else {
      type = 'mongoDB';
      users = await userService.getAllUsers(userId, skip, limit);
    }
    const totalUsers: number = await Get.prototype.usersCont(type);
    return {
      totalUsers,
      users
    };
  }

  private async usersCont(type: string): Promise<number> {
    if (type === 'redis') {
      return await userCache.getTotalUsersFromCache();
    } else if (type === 'mongoDB') {
      return await userService.getTotalUserFromDB();
    } else {
      return 0;
    }
  }

  private async followers(userId: string): Promise<IFollowerData[]> {
    const cachedFollowers: IFollowerData[] = await followerCache.getFollowerFromCache(`followers:${userId}`);
    const result: IFollowerData[] = cachedFollowers.length
      ? cachedFollowers
      : await followerService.getFollowersData(new mongoose.Types.ObjectId(userId));
    return result;
  }
  private async following(userId: string): Promise<IFollowerData[] | void> {}
}
