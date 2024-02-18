import { UserModel } from '@/user/models/user.model';
import mongoose, { Document } from 'mongoose';
import { PushOperator } from 'mongodb';
class BlockUserService {
  public async blockUser(blockingUserId: string, blockedUserId: string) {
    await UserModel.bulkWrite([
      {
        updateOne: {
          filter: {
            _id: blockingUserId,
            blocked: {
              $ne: new mongoose.Types.ObjectId(blockedUserId)
            }
          },
          update: {
            $push: {
              blocked: new mongoose.Types.ObjectId(blockedUserId)
            } as PushOperator<Document>
          }
        }
      },
      {
        updateOne: {
          filter: {
            _id: blockedUserId,
            blockedBy: {
              $ne: new mongoose.Types.ObjectId(blockingUserId)
            }
          },
          update: {
            $push: {
              blockedBy: new mongoose.Types.ObjectId(blockingUserId)
            } as PushOperator<Document>
          }
        }
      }
    ]);
  }

  public async unblockUser(unblockingUserId: string, unblockedUserId: string) {
    await UserModel.bulkWrite([
      {
        updateOne: {
          filter: {
            _id: unblockingUserId,
            blocked: {
              $in: new mongoose.Types.ObjectId(unblockedUserId)
            }
          },
          update: {
            $pull: {
              blocked: new mongoose.Types.ObjectId(unblockedUserId)
            } as PushOperator<Document>
          }
        }
      },
      {
        updateOne: {
          filter: {
            _id: unblockedUserId,
            blockedBy: {
              $in: new mongoose.Types.ObjectId(unblockingUserId)
            }
          },
          update: {
            $pull: {
              blockedBy: new mongoose.Types.ObjectId(unblockingUserId)
            } as PushOperator<Document>
          }
        }
      }
    ]);
  }
}

export const blockUserService: BlockUserService = new BlockUserService();
