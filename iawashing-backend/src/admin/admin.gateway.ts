import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class AdminGateway {
  @WebSocketServer() server!: Server;

  emitSessionUpdate(sessionId: string, payload: any) {
    this.server.to(`session:${sessionId}`).emit('session:update', { sessionId, ...payload });
  }

  handleConnection(socket: any) {
    const sessionId = socket.handshake.query.sessionId as string | undefined;
    if (sessionId) socket.join(`session:${sessionId}`);
  }
}
