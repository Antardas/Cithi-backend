import { Delete } from '@/notification/controllers/delete-notification';
import { authUserPayload } from '@/root/mocks/auth.mock';
import { notificationData, notificationMockRequest, notificationMockResponse } from '@/root/mocks/notification.mock';
import { Request, Response } from 'express';
import * as socketObject from '@/socket/notification';
import { Server } from 'socket.io';
import { DELETE_NOTIFICATION_FROM_DB, notificationQueue } from '@/service/queues/notification.queue';

jest.useRealTimers();
jest.mock('@/service/db/notification.service');
jest.mock('@/service/queues/base.queue');
Object.defineProperties(socketObject, {
  socketIONotificationObject: {
    value: new Server(),
    writable: true
  }
});

describe('Remove', () => {
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
    jest.spyOn(socketObject.socketIONotificationObject, 'emit');
    await Delete.prototype.notification(req, res);
    expect(notificationQueue.addNotificationJob).toHaveBeenCalledWith(DELETE_NOTIFICATION_FROM_DB, {
      key: req.params.id
    });
    expect(socketObject.socketIONotificationObject.emit).toHaveBeenCalledWith('DELETE_NOTIFICATION', req.params.id);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Notification delete successfully'
    });
  });
});
