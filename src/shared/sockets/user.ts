import { ILogin, ISocketData } from '@/user/interfaces/user.interface';
import { Server, Socket } from 'socket.io';

export let socketIoUserObject: Server;
export const connectedUsersMap: Map<string, string> = new Map();

const users: string[] = [];
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

      socket.on('SETUP', (data: ILogin) => {
        this.addClientToMap(data.userId, socket.id);
      });

      socket.on('DISCONNECT', () => {
        this.removeClientFromMap(socket.id);
      });
    });
  }

  private addClientToMap(userId: string, socketId: string): void {
    if (!connectedUsersMap.has(userId)) {
      connectedUsersMap.set(userId, socketId);
    }
  }

  private removeClientFromMap(socketId: string) {
    if (Array.from(connectedUsersMap.values()).includes(socketId)) {
      const disconnectedUser: [string, string] = [...connectedUsersMap].find((user: [string, string]) => {
        return user[1] === socketId;
      }) as [string, string];

      connectedUsersMap.delete(disconnectedUser[0]);
      // TODO: send event to the client
    }
  }
}
