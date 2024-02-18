import { IFileImageDocument } from '@/image/interfaces/image.interface';
import { ImageModel } from '@/image/models/image.schema';
import { UserModel } from '@/user/models/user.model';
import mongoose from 'mongoose';

class ImageService {
  async addUserProfileImageToDB(userId: string, url: string, imgId: string, imgVersion: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      $set: {
        profilePicture: url
      }
    });

    await this.addImage(userId, imgId, imgVersion, 'profile');
  }
  async addBackgroundImageToDB(userId: string, imgId: string, imgVersion: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      $set: {
        bgImageId: imgId,
        bgImageVersion: imgVersion
      }
    });

    await this.addImage(userId, imgId, imgVersion, 'background');
  }

  async addImage(userId: string, imgId: string, imgVersion: string, type: string): Promise<void> {
    await ImageModel.create({
      userId,
      bgImageVersion: type === 'background' ? imgVersion : '',
      bgImageId: type === 'background' ? imgId : '',
      imgVersion,
      imgId
    });
  }

  async removeImageFromDB(imgId: string): Promise<void> {
    await ImageModel.findByIdAndDelete(imgId);
  }

  async getImageByBackgroundId(bgImageId: string): Promise<IFileImageDocument | null> {
    const image: IFileImageDocument | null = await ImageModel.findOne({
      bgImageId
    });

    return image;
  }

  async getImages(userId: string): Promise<IFileImageDocument[]> {
    const image: IFileImageDocument[] = await ImageModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId)
        }
      }
    ]);
    return image;
  }
}
export const imageService: ImageService = new ImageService();
