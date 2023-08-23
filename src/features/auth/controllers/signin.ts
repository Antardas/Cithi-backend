import HTTP_STATUS from 'http-status-codes';
import JWT from 'jsonwebtoken';
import { config } from '@/root/config';
import { NextFunction, Request, Response } from 'express';
import { joiValidation } from '@/global/decorators/joi-validation.decorator';
import { authService } from '@/service/db/auth.service';
import { signInSchema } from '@/auth/schema/signin';
import { IAuthDocument } from '@/auth/interfaces/auth.interface';
import { BadRequestError } from '@/global/helpers/error-handler';
import { IUserDocument } from '@/user/interfaces/user.interface';
import { userService } from '@/service/db/user.service';
import { CookieHandler } from '@/global/helpers/cookie-handler';


export class SignIn {
  @joiValidation(signInSchema)
  public async read(req: Request, res: Response, _next: NextFunction): Promise<void> {

    const { username, password } = req.body;
    const existingUser: IAuthDocument = await authService.getAuthUserByUsername(username);
    if (!existingUser) {
      throw new BadRequestError('username and password wrong');
    }

    const passwordMatch: boolean = await existingUser.comparePassword(password);

    if (!passwordMatch) {
      throw new BadRequestError('username and password wrong');
    }
    const user: IUserDocument = await userService.getUserByAuthId(`${existingUser._id}`);

    const token: string = SignIn.prototype.signToken(existingUser, `${user._id}`);

    req.session = {
      jwt: token
    };
    // console.log(req.session, req.sessionOptions);
    CookieHandler.setCookie(res, 'token', token, {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    const userDocument: IUserDocument = {
      ...user,
      authId: existingUser._id,
      username: existingUser.username,
      email: existingUser.email,
      avatarColor: existingUser.avatarColor,
      uId: existingUser.uId,
      createdAt: existingUser.createdAt
    } as IUserDocument;

    res.status(HTTP_STATUS.OK).json({
      message: 'User logged in successfully',
      user: userDocument,
      token
    });
  }

  private signToken(data: IAuthDocument, userId: string): string {
    return JWT.sign(
      {
        userId: userId,
        uId: data.uId,
        email: data.email,
        username: data.username,
        avatarColor: data.avatarColor
      },
      config.JWT_TOKEN!
    );
  }
}
