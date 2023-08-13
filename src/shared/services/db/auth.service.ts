import { IAuthDocument } from '@/auth/interfaces/auth.interface';
import { AuthModel } from '@/auth/models/auth.schema';
import { Helpers } from '@/global/helpers/helpers';

class AuthService {
  public async createAuthUser(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data);
  }

  public async getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument> {
    const query = {
      $or: [
        {
          username: Helpers.firstLatterUpperCase(username)
        },
        {
          email: Helpers.lowerCase(email)
        }
      ]
    };

    const user: IAuthDocument = (await AuthModel.findOne(query).exec()) as IAuthDocument;
    return user;
  }

  public async getAuthUserByUsername(username: string): Promise<IAuthDocument> {
    const data: IAuthDocument = (await AuthModel.findOne({
      username: Helpers.firstLatterUpperCase(username)
    })) as IAuthDocument;
    return data;
  }
}

export const authService: AuthService = new AuthService();
