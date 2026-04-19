import { Injectable } from '@nestjs/common';

export interface RootEndpointLinks {
  api: string;
  health: string;
  docs: string;
  frontend: string;
}

export interface RootInfoResponse {
  service: string;
  status: string;
  message: string;
  endpoints: RootEndpointLinks;
}

@Injectable()
export class AppService {
  getRootInfo(links: RootEndpointLinks): RootInfoResponse {
    return {
      service: 'AroRano API',
      status: 'ok',
      message: 'Backend is running. Open the frontend on port 3000 for the web app.',
      endpoints: links,
    };
  }

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
