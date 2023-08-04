import { ObjectId } from 'mongodb';
import { Request, Response, NextFunction } from 'express';
import { joiValidation } from '@/global/decorators/joi-validation.decorator';
import { signupSchema } from '@/auth/schema/signup';
import { authService } from '@/service/db/auth.service';
import { BadRequestError } from '@/global/helpers/error-handler';
import { IAuthDocument, ISignUpData } from '@/auth/interfaces/auth.interface';
import { Helpers } from '@/global/helpers/helpers';
import { UploadApiErrorResponse, UploadApiResponse, UploadResponseCallback } from 'cloudinary';
import { uploads } from '@/global/helpers/cloudinary-upload';
import HTTP_STATUS from 'http-status-codes';
import { IUserDocument } from '@/user/interfaces/user.interface';
import { UserCache } from '@/service/redis/user.cache';
import { config } from '@/root/config';

const userCache: UserCache = new UserCache();
export class SignUp {
  @joiValidation(signupSchema)
  public async create(req: Request, res: Response, _next: NextFunction) {
    const { username, email, password, avatarColor, avatarImage } = req.body;
    const checkIfUserExist: IAuthDocument = await authService.getUserByUsernameOrEmail(
      username,
      email
    );
    if (checkIfUserExist) {
      throw new BadRequestError('Invalid Credentials');
    }

    const authObjectId: ObjectId = new ObjectId();
    const userObjectId: ObjectId = new ObjectId();
    const uId: string = `${Helpers.generateRandomIntegers(12)}`;
    const authData: IAuthDocument = SignUp.prototype.signupData({
      username,
      _id: authObjectId,
      uId,
      email,
      avatarColor,
      password
    });

    const result: UploadApiResponse = (await uploads(
      avatarImage,
      userObjectId.toString(),
      true,
      true
    )) as UploadApiResponse;
    if (!result?.public_id) {
      throw new BadRequestError('File Upload: Error Occurred. Try Again...');
    }

    // Add to redis cache
    const userDataForCache: IUserDocument = SignUp.prototype.userData(authData, userObjectId);

    userDataForCache.profilePicture = `https://res.cloudinary.com/${
      config.CLOUD_NAME
    }/image/upload/v${result.version}/${userObjectId.toString()}`;
    await userCache.saveUserToCache(`${userObjectId.toString()}`, uId, userDataForCache);
    res.status(HTTP_STATUS.CREATED).json({ message: 'User Created Successfully', authData });
  }

  private signupData(data: ISignUpData): IAuthDocument {
    const { _id, username, email, uId, password, avatarColor } = data;

    return {
      _id,
      username: Helpers.firstLatterUpperCase(username),
      uId,
      email: Helpers.lowerCase(email),
      password,
      avatarColor,
      createdAt: new Date()
    } as IAuthDocument;
  }

  private userData(data: IAuthDocument, userObjectId: ObjectId): IUserDocument {
    const { _id, username, email, uId, password, avatarColor } = data;
    return {
      _id: userObjectId,
      authId: _id,
      uId,
      username: Helpers.firstLatterUpperCase(username),
      email,
      password,
      avatarColor,
      profilePicture: '',
      blocked: [],
      blockedBy: [],
      work: '',
      location: '',
      school: '',
      quote: '',
      bgImageVersion: '',
      bgImageId: '',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      notifications: {
        comments: true,
        follows: true,
        messages: true,
        reactions: true
      },
      social: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: ''
      }
    } as unknown as IUserDocument;
  }
}