import { IFollower } from '@/follower/interfaces/follower.interface';
import { Server, Socket } from 'socket.io';

export let socketIOFollowerObject: Server;

export class SocketIOFollowerHandler {
  private io: Server;
  constructor(io: Server) {
    this.io = io;
    socketIOFollowerObject = io;
  }

  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      socket.on('UNFOLLOW_USER', (data: IFollower) => {
        this.io.emit('REMOVE_FOLLOWER', data);
			});


    });
  }
}
