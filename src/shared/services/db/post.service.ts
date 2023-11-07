import { userService } from '@/service/db/user.service';
import { IGetPostsQuery, IPostDocument, IQueryComplete, IQueryDelete } from '@/post/interfaces/post.interface';
import { PostModel } from '@/post/model/post.model';
import { UserModel } from '@/user/models/user.model';
import { Query, UpdateQuery } from 'mongoose';
import { IUserDocument } from '@/user/interfaces/user.interface';

class PostService {
  public async addPost(userId: string, data: IPostDocument): Promise<void> {
    const post: Promise<IPostDocument> = PostModel.create(data);
    await Promise.all([post, userService.incrementPostCount(userId)]);
  }

  public async getPosts(query: IGetPostsQuery, skip = 0, limit = 0, sort: Record<string, 1 | -1>): Promise<IPostDocument[]> {
    let postQuery = {};
    if (query?.imgId && query.gifUrl) {
      postQuery = {
        $or: [{ imgId: { $ne: '' } }, { gifUrl: { $ne: '' } }]
      };
    } else {
      postQuery = query;
    }

    const posts: IPostDocument[] = await PostModel.aggregate([
      {
        $match: postQuery
      },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit }
    ]);

    return posts;
  }

  public async postCount(): Promise<number> {
    const count: number = await PostModel.find({}).countDocuments();
    return count;
  }
  public async deletePost(postId: string, userId: string): Promise<void> {
    const deletedPost: Query<IQueryDelete & IQueryComplete, IPostDocument> = PostModel.deleteOne({ _id: postId });
    // TODO: Delete Reaction
    const decrementPostCount: UpdateQuery<IUserDocument> = UserModel.updateOne(
      { _id: userId },
      {
        $inc: {
          postsCount: -1
        }
      }
    );

    await Promise.all([deletedPost, decrementPostCount]);
  }

  public async updatePost(postId: string, updatedPost: IPostDocument): Promise<void> {
    const post: UpdateQuery<IPostDocument> = await PostModel.updateOne(
      { _id: postId },
      {
        $set: updatedPost
      }
    );
  }
}

export const postService: PostService = new PostService();
