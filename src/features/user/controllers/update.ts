import { UserModel } from '@/user/models/user.model';
import HTTP_STATUS from 'http-status-codes';
import { IResetPasswordTemplateParams, ISearchUser, IUserDocument } from '@/user/interfaces/user.interface';
import { Helpers } from '@/global/helpers/helpers';
import { Request, Response } from 'express';
import { BadRequestError, NotAuthorizedError } from '@/global/helpers/error-handler';
import { joiValidation } from '@/global/decorators/joi-validation.decorator';
import { basicInfoSchema, changePasswordSchema, notificationSettingsSchema, socialLinksSchema } from '@/user/schema/info';
import { IAuthDocument } from '@/auth/interfaces/auth.interface';
import moment from 'moment';
import publicIP from 'ip';
import { authService } from '@/service/db/auth.service';
import { userService } from '@/service/db/user.service';
import { UserCache } from '@/service/redis/user.cache';
import { resetPasswordTemplate } from '@/service/emails/reset-password/reset-password-template';
import { CHANGE_PASSWORD, emailQueue } from '@/service/queues/email.queue';
import { UPDATE_BASIC_INFO_TO_DB, UPDATE_NOTIFICATIONS_SETTINGS_TO_DB, UPDATE_SOCIAL_LINKS_TO_DB, userQueue } from '@/service/queues/user.queue';

const userCache: UserCache = new UserCache();
export class Update {
  @joiValidation(changePasswordSchema)
  public async password(req: Request, res: Response): Promise<void> {
    const { newPassword, confirmPassword, currentPassword } = req.body;

    if (newPassword !== confirmPassword) {
      throw new BadRequestError('Confirm password didnt match');
    }
    const existingUser: IAuthDocument = await authService.getAuthUserByUsername(`${req.currentUser?.username}`);
    if (!existingUser) {
      throw new NotAuthorizedError('Youre not logged in');
    }

    const isPasswordMatch = await existingUser.comparePassword(currentPassword);
    if (!isPasswordMatch) {
      throw new BadRequestError('Invalid credentials');
    }

    const newPasswordHash = await existingUser.hashPassword(newPassword);

    await userService.updatePassword(`${req.currentUser?.userId}`, newPasswordHash);

    const passwordResetTemplateParams: IResetPasswordTemplateParams = {
      username: existingUser.username,
      email: existingUser.email,
      ipAddress: publicIP.address(),
      date: moment().format('DD/MM/YYYY HH:mm')
    };
    const template: string = resetPasswordTemplate.renderResetConfirmationTemplate(passwordResetTemplateParams);

    emailQueue.addEmailJob(CHANGE_PASSWORD, {
      subject: 'Update Password Successfully',
      template,
      receiverEmail: existingUser.email
    });
    res.status(HTTP_STATUS.OK).json({
      message: 'Password changed adn you will redirect to login page shortly'
    });
  }

  @joiValidation(basicInfoSchema)
  public async basicInfo(req: Request, res: Response): Promise<void> {
    const { quote, work, school, location } = req.body;
    await userCache.updateBasicInfo(`${req.currentUser?.userId}`, { quote, work, school, location });
    userQueue.addUserJob(UPDATE_BASIC_INFO_TO_DB, {
      key: `${req.currentUser?.userId}`,
      value: {
        quote,
        work,
        school,
        location
      }
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Update the basic info' });
  }

  @joiValidation(socialLinksSchema)
  public async socialLinks(req: Request, res: Response): Promise<void> {
    const { facebook, instagram, twitter, youtube } = req.body;
    await userCache.updateSocialLinks(`${req.currentUser?.userId}`, { facebook, instagram, twitter, youtube });
    userQueue.addUserJob(UPDATE_SOCIAL_LINKS_TO_DB, {
      key: `${req.currentUser?.userId}`,
      value: {
        facebook,
        instagram,
        twitter,
        youtube
      }
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Update the social link' });
  }
  @joiValidation(notificationSettingsSchema)
  public async notificationSettings(req: Request, res: Response): Promise<void> {
    const { comments, follows, messages, reactions } = req.body;
    await userCache.updateNotificationSetting(`${req.currentUser?.userId}`, { comments, follows, messages, reactions });
    userQueue.addUserJob(UPDATE_NOTIFICATIONS_SETTINGS_TO_DB, {
      key: `${req.currentUser?.userId}`,
      value: {
        comments,
        follows,
        messages,
        reactions
      }
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Update the notification settings successfully', data: { comments, follows, messages, reactions } });
  }
}
