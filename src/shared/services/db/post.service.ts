import { userService } from '@/service/db/user.service';
import { IPostDocument } from '@/post/interfaces/post.interface';
import { PostModel } from '@/post/model/post.model';


class PostService {
  public async addPost(userId: string, data: IPostDocument): Promise<void> {
    const post: Promise<IPostDocument> = PostModel.create(data);
    await Promise.all([post, userService.incrementPostCount(userId)]);
  }
}

export const postService: PostService = new PostService();
