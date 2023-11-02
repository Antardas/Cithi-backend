import { userService } from '@/service/db/user.service';
import { IGetPostsQuery, IPostDocument } from '@/post/interfaces/post.interface';
import { PostModel } from '@/post/model/post.model';

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
}

export const postService: PostService = new PostService();
