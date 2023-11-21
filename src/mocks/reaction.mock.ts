import { AuthPayload } from '@/auth/interfaces/auth.interface';
import { IReactionDocument, IReactions } from '@/reaction/interfaces/reaction.interface';
import { IJWT } from '@/root/mocks/auth.mock';
import { Response } from 'express';

export const reactionMockRequest = (sessionData: IJWT, body: IBody, currentUser?: AuthPayload | null, params?: IReactionParams) => ({
  session: sessionData,
  body,
  currentUser,
  params
});

export const reactionMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

export interface IBody {
  postId?: string;
  comment?: string;
  profilePicture?: string;
  userTo?: string;
  type?: string;
  previousReaction?: string;
  postReactions?: IReactions;
}

export interface IReactionParams {
  postId?: string;
  page?: string;
  commentId?: string;
  reactionId?: string;
  previousReaction?: string;
  username?: string;
  postReactions?: string;
}

export const reactionData: IReactionDocument = {
  _id: '6064861bc25eaa5a5d2f9bf4',
  username: 'Devant',
  postId: '654dee80dcbd3f94546f3bc1',
  profilePicture: 'https://res.cloudinary.com/ratingapp/image/upload/6064793b091bf02b6a71067a',
  comment: 'This is a comment',
  createdAt: new Date(),
  userTo: '60263f14648fed5246e322d9',
  type: 'love'
} as unknown as IReactionDocument;

//
