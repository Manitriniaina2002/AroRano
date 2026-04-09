import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { message: string } {
    return {
      message: 'Welcome to AroRano API!',
    };
  }

  getHealth(): { status: string; message: string } {
    return {
      status: 'ok',
      message: 'Server is running',
    };
  }
}
