import fs from 'fs';
import ejs from 'ejs';
import { INotificationTemplate } from '@/notification/interfaces/notification.interface';

class NotificationTemplate {
  public notificationMessageTemplate(templateParam: INotificationTemplate): string {
    const { header, message, username } = templateParam;
    return ejs.render(fs.readFileSync(__dirname + '/notification.ejs', 'utf-8'), { header, message, username, image_url: '' });
  }
}

export const notificationTemplate: NotificationTemplate = new NotificationTemplate();
