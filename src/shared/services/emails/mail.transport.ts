import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import Logger from 'bunyan';
import { config } from '@/root/config';
import { BadRequestError } from '@/global/helpers/error-handler';

interface IMailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

const log: Logger = config.createLogger('Mail');

class MailTransport {
  public async sendEmail(receiverEmail: string, subject: string, body: string): Promise<void> {
    const transporter: nodemailer.Transporter = nodemailer.createTransport({
      host: config.BREVO_HOST,
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: config.SENDER_EMAIL, // generated ethereal user
        pass: config.SENDER_EMAIL_PASSWORD // generated ethereal password
      }
    });
log.info('data of mail', {
  host: config.BREVO_HOST,
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: config.SENDER_EMAIL, // generated ethereal user
    pass: config.SENDER_EMAIL_PASSWORD // generated ethereal password
  }
});
    const mailOptions: IMailOptions = {
      from: `Chithi App <${config.SENDER_EMAIL}>`,
      to: receiverEmail,
      subject,
      html: body
    };

    try {
      await transporter.sendMail(mailOptions);
      log.info('email sended successfully');
    } catch (error) {
      log.error('Error sending email', error);
      throw new BadRequestError('Error sending Email');
    }
  }
}

export const mailTransport: MailTransport = new MailTransport();
