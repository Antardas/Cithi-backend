import HTTP_STATUS from 'http-status-codes';
import { userService } from '@/service/db/user.service';
import { UserCache } from '@/service/redis/user.cache';
import { IUserDocument } from '@/user/interfaces/user.interface';
import { NextFunction, Request, Response } from 'express';
const userCache: UserCache = new UserCache();
export class CurrentUser {
  public async read(req: Request, res: Response, _next: NextFunction) {
    let isUser = false,
      token = null,
      user = null;
    console.log(req.currentUser, 'currentUser');

    const cachedUser: IUserDocument = (await userCache.getUserFromCache(`${req.currentUser!.userId}`)) as IUserDocument;
    console.log(cachedUser, 'cachedUser');

    const existingUser: IUserDocument = cachedUser ? cachedUser : await userService.getUserById(`${req.currentUser!.userId}`);

    if (Object.keys(existingUser).length) {
      isUser = true;
      token = req.cookies?.token;
      user = existingUser;
    }
    res.status(HTTP_STATUS.OK).json({
      token,
      user,
      isUser
    });
  }
}
