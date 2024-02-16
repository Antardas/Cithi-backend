import HTTP_STATUS from 'http-status-codes';
import { ISearchUser } from '@/user/interfaces/user.interface';
import { Helpers } from '@/global/helpers/helpers';
import { Request, Response } from 'express';
import { userService } from '@/service/db/user.service';

export class Search {
  public async user(req: Request, res: Response): Promise<void> {
    const regex: RegExp = new RegExp(Helpers.escapeRegex(req.params.query), 'i');

    // NOTE: I didn't add redis searching it's bit complex but soon I will add it
    const users: ISearchUser[] = await userService.searchUsers(regex);
console.log(regex);

    res.status(HTTP_STATUS.OK).json({
      message: 'search result',
      data: users
    });
  }
}
