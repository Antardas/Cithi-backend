import HTTP_STATUS from 'http-status-codes';
import express, { Router, Request, Response } from 'express';
import moment from 'moment';
import { performance } from 'perf_hooks';
import { config } from '@/root/config';
import axios from 'axios';
class HealthRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/health', this.health);
    this.router.get('/env', this.env);
    this.router.get('/instance', this.instance);
    this.router.get('/fibo/:num', this.fibonacci);
    return this.router;
  }
  private health(req: Request, res: Response): void {
    res.status(HTTP_STATUS.OK).send(`Health: Server instance healthy with process id ${process.pid} on ${moment().format('LL')}`);
  }

  private env(req: Request, res: Response): void {
    res.status(HTTP_STATUS.OK).send(`This is the ${config.NODE_ENV} environment.`);
  }

  private async instance(req: Request, res: Response): Promise<void> {
    const response = await axios({
      method: 'GET',
      url: config.EC2_URL
    });
    res.status(HTTP_STATUS.OK).send(`Server is running on EC2 instance with id  ${response.data} and Process id  on ${moment().format('LL')}`);
  }

  private async fibonacci(req: Request, res: Response): Promise<void> {
    // const response = await axios({
    //   method: 'GET',
    //   url: config.EC2_URL
    // });
    const start: number = performance.now();
    const num = req.params.num || '2';
    function fibo(numArg: number): number {
      if (numArg <= 1) {
        return numArg;
      }
      return fibo(numArg - 2) + fibo(numArg - 1);
    }
    let result: number = 0;
    if (2 > parseInt(`${num}`, 10)) {
      result = 1;
    } else {
      result = fibo(parseInt(`${num}`, 10));
    }
    const end: number = performance.now();
    res
      .status(HTTP_STATUS.OK)
      .send(`Fibonacci series of ${num} is ${result} and it's took   ${end - start} ms with ec2 instance of id   ${123}`);
  }
}

export const healthRoute: HealthRoutes = new HealthRoutes();
