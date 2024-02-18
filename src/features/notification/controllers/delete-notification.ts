import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { DELETE_NOTIFICATION_FROM_DB, notificationQueue } from '@/service/queues/notification.queue';
import { socketIONotificationObject } from '@/socket/notification';

export class Delete {
  public async notification(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    socketIONotificationObject.emit('DELETE_NOTIFICATION', id);

    notificationQueue.addNotificationJob(DELETE_NOTIFICATION_FROM_DB, {
      key: id
    });
    res.status(HTTP_STATUS.OK).json({
      message: 'Notification delete successfully'
    });
  }
}
