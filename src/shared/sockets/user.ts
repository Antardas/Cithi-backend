import { ISocketData } from '@/user/interfaces/user.interface';
import { Server, Socket } from 'socket.io';
let socketIoUserObject: Server;

export class SocketIoUserHandler {
  private io: Server;
  constructor(io: Server) {
    this.io = io;
    socketIoUserObject = io;
  }

  public handler(): void {
    this.io.on('connection', (socket: Socket) => {
      socket.on('BLOCK_USER', (data: ISocketData) => {
        this.io.emit('BLOCK_USER_ID', data);
      });
      socket.on('UNBLOCK_USER', (data: ISocketData) => {
        this.io.emit('UNBLOCK_USER_ID', data);
      });
    });
  }
}
