import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiOkResponse({ description: 'Server is healthy' })
  getHealth(): { status: string; message: string } {
    return this.appService.getHealth();
  }

  @Get('')
  @ApiOperation({ summary: 'Welcome message' })
  @ApiOkResponse({ description: 'Welcome to API' })
  getHello(): { message: string } {
    return this.appService.getHello();
  }
}
