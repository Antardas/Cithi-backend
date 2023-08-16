import fs from 'fs';
import ejs from 'ejs';

class ForgotPasswordTemplate {
  public renderForgotTemplate(username: string, resetLink: string): string {
    return ejs.render(fs.readFileSync(__dirname + '/forgot-password-template.ejs', 'utf-8'), {
      username,
      resetLink,
      image_url: 'https://cdn-icons-png.flaticon.com/512/2344/2344160.png'
    });
  }
}

export const forgotPasswordTemplate: ForgotPasswordTemplate = new ForgotPasswordTemplate();
