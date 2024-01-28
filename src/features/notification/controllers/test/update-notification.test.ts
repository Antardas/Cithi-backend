import { Update } from '@/notification/controllers/update-notification';
import { authUserPayload } from '@/root/mocks/auth.mock';
import { notificationData, notificationMockRequest, notificationMockResponse } from '@/root/mocks/notification.mock';
import { notificationService } from '@/service/db/notification.service';
import { Request, Response } from 'express';
import * as socketObject from '@/socket/notification';
import { Server } from 'socket.io';
import { UPDATE_NOTIFICATION_FROM_DB, notificationQueue } from '@/service/queues/notification.queue';

jest.useRealTimers();
jest.mock('@/service/db/notification.service');
jest.mock('@/service/queues/base.queue');
Object.defineProperties(socketObject, {
  socketIONotificationObject: {
    value: new Server(),
    writable: true
  }
});

describe('Update', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should return correct json', async () => {
    const req: Request = notificationMockRequest({}, authUserPayload, {
      id: `${notificationData._id}`
    }) as Request;
    const res: Response = notificationMockResponse();
    jest.spyOn(notificationQueue, 'addNotificationJob');
    await Update.prototype.notification(req, res);
    expect(notificationQueue.addNotificationJob).toHaveBeenCalledWith(UPDATE_NOTIFICATION_FROM_DB, {
      key: req.params.id
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Notification marked as read'
    });
  });
});
