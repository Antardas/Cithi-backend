import { joiValidation } from '@/global/decorators/joi-validation.decorator';
import { IAuthDocument } from '@/auth/interfaces/auth.interface';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { BadRequestError } from '@/global/helpers/error-handler';
import { config } from '@/root/config';
import { authService } from '@/service/db/auth.service';
import { emailSchema, passwordSchema } from '@/auth/schema/password';
import crypto from 'crypto';
import { IResetPasswordTemplateParams } from '@/user/interfaces/user.interface';
import { forgotPasswordTemplate } from '@/service/emails/forgot-password/forgot-password-template';
import { emailQueue } from '@/service/queues/email.queue';
import { resetPasswordTemplate } from '@/service/emails/reset-password/reset-password-template';
import publicIP from 'ip';
import moment from 'moment';

export class Password {
  @joiValidation(emailSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    const user: IAuthDocument = await authService.getAuthUserByEmail(email);

    if (!user) {
      throw new BadRequestError('Invalid Credentials');
    }

    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacter: string = randomBytes.toString('hex');

    await authService.updatePasswordToken(`${user._id}`, randomCharacter, Date.now() + 60 * 60 * 1000);

    // const template: string = forgotPasswordTemplate.renderForgotTemplate(user.username!, resetLink);
    const resetLink: string = `${config.CLIENT_URL}/reset-password?token=${randomCharacter}`;
    const template: string = forgotPasswordTemplate.renderForgotTemplate(user.username, resetLink);
    emailQueue.addEmailJob('forgetPasswordEmail', {
      subject: 'Reset your Password  ',
      template,
      receiverEmail: user.email
    });

    res.status(HTTP_STATUS.OK).json({
      message: 'Email Send Successfully'
    });
  }

  @joiValidation(passwordSchema)
  public async update(req: Request, res: Response): Promise<void> {
    const { password, confirmPassword } = req.body;
    const { token } = req.params;

    if (password !== confirmPassword) {
      throw new BadRequestError('Password does not match');
    }

    const user: IAuthDocument = await authService.getAuthUserByPasswordToken(token);

    if (!user) {
      throw new BadRequestError('Reset Token has expired');
    }

    user.password = password;
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save();
    const passwordResetTemplateParams: IResetPasswordTemplateParams = {
      username: user.username,
      email: user.email,
      ipAddress: publicIP.address(),
      date: moment().format('DD/MM/YYYY HH:mm')
    };
    const template: string = resetPasswordTemplate.renderResetConfirmationTemplate(passwordResetTemplateParams);

    emailQueue.addEmailJob('forgetPasswordEmail', {
      subject: 'Reset Password Successfully',
      template,
      receiverEmail: user.email
    });

    res.status(HTTP_STATUS.OK).json({
      message: 'Reset Password Successfully'
    });
  }
}
