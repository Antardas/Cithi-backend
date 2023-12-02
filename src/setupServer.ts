import { Application, json, urlencoded, Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import cookieSession from 'cookie-session';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import HTTP_STATUS from 'http-status-codes';
import 'express-async-errors';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import applicationRoutes from '@/root/routes';
import Logger from 'bunyan';
import { config } from '@/root/config';
import { CustomError, IErrorResponse } from '@/global/helpers/error-handler';
import { SockIOPostHandler } from '@/socket/post';

const SERVER_PORT = 5000;
const log: Logger = config.createLogger('server');
export class ChattyServer {
  private app: Application;
  constructor(app: Application) {
    this.app = app;
  }

  public start(): void {
    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.routeMiddleware(this.app);
    this.globalErrorHandler(this.app);
    this.startServer(this.app);
  }

  private securityMiddleware(app: Application): void {
    app.use(cookieParser());
    app.use(
      cookieSession({
        name: 'session',
        keys: [config.SECRET_KEY_ONE!, config.SECRET_KEY_TWO!],
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: config.NODE_ENV !== 'development' //TODO: in production make sure it's true
      })
    );
    // NOTE: know the use case
    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        origin: [config.CLIENT_URL, '*'] as string[], // TODO: make it actual origin in production
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      })
    );
  }

  private standardMiddleware(app: Application): void {
    app.use(compression());
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));
  }

  private routeMiddleware(app: Application): void {
    applicationRoutes(app);
  }

  private globalErrorHandler(app: Application): void {
    // if route not found
    app.all('*', async (req: Request, res: Response) => {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: `${req.originalUrl} not found` });
    });

    app.use((error: IErrorResponse, req: Request, res: Response, next: NextFunction) => {
      log.error(error);
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json(error.serializeError());
      }
      next();
    });
  }

  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app);
      const socketIO: Server = await this.createSocketIO(httpServer);
      this.startHttpServer(httpServer);
      this.socketIOConnections(socketIO);
    } catch (error) {
      log.error(error);
    }
  }

/**
 * Creates and configures a Socket.IO server to handle connections on the given HTTP server.
 * @param httpServer - The HTTP server instance to attach the Socket.IO server to.
 * @returns A Promise resolving to the configured Socket.IO server instance.
 */
private async createSocketIO(httpServer: http.Server): Promise<Server> {
  // Create a new Socket.IO server instance with CORS configuration.
  const io: Server = new Server(httpServer, {
    cors: {
      origin: config.CLIENT_URL, // Allow connections from the specified client URL.
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] // Allow specified HTTP methods.
    }
  });

  // Create a Redis pub/sub client for handling socket.io scaling across multiple server instances.
  const pubClient = createClient({
    url: config.REDIS_HOST
  });

  // Create a duplicate Redis client for subscribing to channels.
  const subClient = pubClient.duplicate();

  // Handle errors for both pubClient and subClient.
  pubClient.on('error', (err) => {
    log.error(err.message);
  });

  subClient.on('error', (err) => {
    log.error(err.message);
  });

  await Promise.all([pubClient.connect(), subClient.connect()]);

  // Configure Socket.IO to use the Redis adapter for handling scaling across multiple instances.
  io.adapter(createAdapter(pubClient, subClient));

  return io;
}

  private startHttpServer(httpServer: http.Server): void {
    log.info(`Server has started  with process ${process.pid}`);

    httpServer.listen(SERVER_PORT, () => {
      log.info(`Server Running on port: ${SERVER_PORT}`);
    });
  }

  private socketIOConnections(io: Server): void {
    const postSocketHandler: SockIOPostHandler = new SockIOPostHandler(io);
    postSocketHandler.listen();
  }
}
