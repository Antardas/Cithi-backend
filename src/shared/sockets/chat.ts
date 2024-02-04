import { ISenderReceiver } from '@/chat/interfaces/message.interface';
import { Server, Socket } from 'socket.io';

export let socketIOChatObject: Server;

export class SocketIOChatHandler {
  private io: Server;
  constructor(io: Server) {
    this.io = io;
    socketIOChatObject = io;
  }

  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      socket.on('JOIN_ROOM', (data: ISenderReceiver) => {
        console.log(data);
      });
    });
  }
}
