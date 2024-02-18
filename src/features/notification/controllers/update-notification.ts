import HTTP_STATUS from 'http-status-codes';
import { UPDATE_NOTIFICATION_FROM_DB, notificationQueue } from '@/service/queues/notification.queue';
import { socketIONotificationObject } from '@/socket/notification';
import { Request, Response } from 'express';

export class Update {
  public async notification(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    socketIONotificationObject.emit('UPDATE_NOTIFICATION', id);

    notificationQueue.addNotificationJob(UPDATE_NOTIFICATION_FROM_DB, {
      key: id
    });
    res.status(HTTP_STATUS.OK).json({
      message: 'Notification marked as read'
    });
  }
}
