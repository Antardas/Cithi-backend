import fs from 'fs';
import ejs from 'ejs';
import { IResetPasswordParams } from '@/user/interfaces/user.interface';

class ResetPasswordTemplate {
  public renderResetConfirmationTemplate(templateParams: IResetPasswordParams): string {
    return ejs.render(fs.readFileSync(__dirname + '/reset-password-template.ejs', 'utf-8'), {
      ...templateParams,
      
      image_url: 'https://cdn-icons-png.flaticon.com/512/2344/2344160.png'
    });
  }
}

export const resetPasswordTemplate: ResetPasswordTemplate = new ResetPasswordTemplate();
