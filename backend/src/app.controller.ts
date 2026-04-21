import { Controller, Get, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import type { Request } from 'express';
import { AppService, RootInfoResponse } from './app.service';

function getFrontendUrl(requestUrl: URL): string {
  const configuredFrontendUrl = process.env.FRONTEND_URL?.trim();

  if (configuredFrontendUrl) {
    try {
      return new URL(configuredFrontendUrl).toString().replace(/\/$/, '');
    } catch {
      return configuredFrontendUrl.replace(/\/$/, '');
    }
  }

  const frontendUrl = new URL(requestUrl.toString());
  frontendUrl.port = '3000';
  frontendUrl.pathname = '';
  frontendUrl.search = '';
  frontendUrl.hash = '';

  return frontendUrl.toString().replace(/\/$/, '');
}

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Backend service information' })
  @ApiOkResponse({ description: 'Backend routes and service status' })
  getRoot(@Req() req: Request): RootInfoResponse {
    const protocolHeader = req.headers['x-forwarded-proto'];
    const protocol = Array.isArray(protocolHeader)
      ? protocolHeader[0]
      : protocolHeader?.split(',')[0] || req.protocol || 'http';
    const host = req.headers.host || 'localhost:3001';
    const requestUrl = new URL(`${protocol}://${host}`);

    return this.appService.getRootInfo({
      api: `${requestUrl.origin}/api`,
      health: `${requestUrl.origin}/api/health`,
      docs: `${requestUrl.origin}/api/docs`,
      frontend: getFrontendUrl(requestUrl),
    });
  }

  @Get('api/health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiOkResponse({ description: 'Server is healthy' })
  getHealth(): { status: string; message: string } {
    return this.appService.getHealth();
  }

  @Get('api')
  @ApiOperation({ summary: 'Welcome message' })
  @ApiOkResponse({ description: 'Welcome to API' })
  getHello(): { message: string } {
    return this.appService.getHello();
  }
}
