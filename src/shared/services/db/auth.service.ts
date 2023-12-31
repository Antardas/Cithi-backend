import { IAuthDocument } from '@/auth/interfaces/auth.interface';
import { AuthModel } from '@/auth/models/auth.model';
import { Helpers } from '@/global/helpers/helpers';

class AuthService {
  public async createAuthUser(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data);
  }

  public async updatePasswordToken(authId: string, token: string, tokenExpiration: number): Promise<void> {
    await AuthModel.updateOne(
      {
        _id: authId
      },
      {
        passwordResetToken: token,
        passwordResetExpires: tokenExpiration
      }
    );
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

  public async getAuthUserByEmail(email: string): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({
      email: Helpers.lowerCase(email)
    })) as IAuthDocument;
    return user;
  }

  public async getAuthUserByPasswordToken(token: string): Promise<IAuthDocument> {
    // Delete if it's expired
    const user: IAuthDocument = (await AuthModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: {
        $gt: Date.now()
      }
    })) as IAuthDocument;
    return user;
  }
}

export const authService: AuthService = new AuthService();
