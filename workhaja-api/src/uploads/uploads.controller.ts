import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StoreContextInterceptor } from '../stores/interceptors/store-context.interceptor';
import { UploadsService } from './uploads.service';
import { PresignUploadDto } from './dto';

@Controller('stores/:storeId/uploads')
@UseGuards(JwtAuthGuard)
@UseInterceptors(StoreContextInterceptor)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  /**
   * Generate presigned URL for file upload
   */
  @Post('presign')
  async presign(
    @Param('storeId') storeId: string,
    @Body() presignDto: PresignUploadDto,
  ) {
    const result = await this.uploadsService.generatePresignedUrl(
      storeId,
      presignDto.purpose,
      presignDto.filename,
      presignDto.contentType,
    );

    return result;
  }
}

