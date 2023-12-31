import { Server, Socket } from 'socket.io';
import { IReactionDocument } from '@/reaction/interfaces/reaction.interface';
import { ICommentDocument } from '@/comment/interfaces/comment.interface';

export let socketIOPostObject: Server;

export class SockIOPostHandler {
  private io: Server;
  constructor(io: Server) {
    this.io = io;
    socketIOPostObject = io;
  }

  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log('Post Socket IO handler');

      socket.on('reaction', (reaction: IReactionDocument) => {
        this.io.emit('update like', reaction);
      });

      socket.on('comment', (comment: ICommentDocument) => {
        this.io.emit('update comment', comment);
      });
    });
  }
}
