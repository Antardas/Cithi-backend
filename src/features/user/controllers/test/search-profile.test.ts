import { Search } from '@/user/controllers/search-profile';
import { chatMockRequest, chatMockResponse } from '@/root/mocks/chat.mock';
import { userService } from '@/service/db/user.service';
import { Request, Response } from 'express';
import { searchedUserMock } from '@/root/mocks/user.mock';
import { authMockRequest, authMockResponse, authUserPayload } from '@/root/mocks/auth.mock';

describe('Search', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('user', () => {
    it('should send correct json response if searched user exist', async () => {
      const req: Request = authMockRequest({}, {}, authUserPayload, { query: 'Danny' }, {}) as unknown as Request;
      const res: Response = chatMockResponse();
      jest.spyOn(userService, 'searchUsers').mockResolvedValue([searchedUserMock]);

      await Search.prototype.user(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'search result',
        data: [searchedUserMock]
      });
    });

    it('should send correct json response if searched user does not exist', async () => {
      const req: Request = authMockRequest({}, {}, authUserPayload, { query: 'DannyBoy' }, {}) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(userService, 'searchUsers').mockResolvedValue([]);

      await Search.prototype.user(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'search result',
        data: []
      });
    });
  });
});
