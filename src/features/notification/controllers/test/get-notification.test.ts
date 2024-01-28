import { Get } from '@/notification/controllers/get-notification';
import { authUserPayload } from '@/root/mocks/auth.mock';
import { notificationData, notificationMockRequest, notificationMockResponse } from '@/root/mocks/notification.mock';
import { notificationService } from '@/service/db/notification.service';
import { Request, Response } from 'express';

jest.useRealTimers();
describe('Get', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });
  it('should return correct json', async () => {
    const req: Request = notificationMockRequest({}, authUserPayload, {}) as Request;
    const res: Response = notificationMockResponse();
    jest.spyOn(notificationService, 'getNotifications').mockResolvedValue([notificationData]);

    await Get.prototype.notification(req, res);
    expect(notificationService.getNotifications).toHaveBeenCalledWith(req.currentUser?.userId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: [notificationData],
      message: 'All Notifications'
    });
  });

  it('should return correct json if notification not exist', async () => {
    const req: Request = notificationMockRequest({}, authUserPayload, {}) as Request;
    const res: Response = notificationMockResponse();
    jest.spyOn(notificationService, 'getNotifications').mockResolvedValue([]);

    await Get.prototype.notification(req, res);
    expect(notificationService.getNotifications).toHaveBeenCalledWith(req.currentUser?.userId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: [],
      message: 'All Notifications'
    });
  });
});
