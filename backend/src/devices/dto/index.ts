export class CreateDeviceDto {
  name: string;
  type: string;
  location: string;
  status?: string;
  metadata?: Record<string, any>;
}

export class UpdateDeviceDto {
  name?: string;
  location?: string;
  status?: string;
  metadata?: Record<string, any>;
}

export class AddReadingDto {
  value: number;
  unit: string;
}
