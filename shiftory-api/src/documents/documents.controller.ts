import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequestUser } from '../auth/strategies/jwt.strategy';
import { StoreContextInterceptor } from '../stores/interceptors/store-context.interceptor';
import { Role, DocumentType } from '@prisma/client';

/**
 * DocumentsController handles document management endpoints
 */
@Controller('stores/:storeId/documents')
@UseGuards(JwtAuthGuard)
@UseInterceptors(StoreContextInterceptor)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  /**
   * Create a document
   * POST /stores/:storeId/documents
   * Requires: OWNER or MANAGER role
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  async createDocument(
    @Param('storeId') storeId: string,
    @CurrentUser() user: RequestUser,
    @Body() createDto: CreateDocumentDto,
  ) {
    return this.documentsService.createDocument(
      storeId,
      user.id,
      createDto,
    );
  }

  /**
   * Update a document
   * PUT /stores/:storeId/documents/:documentId
   * Requires: OWNER or MANAGER role
   */
  @Put(':documentId')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  async updateDocument(
    @Param('storeId') storeId: string,
    @Param('documentId') documentId: string,
    @CurrentUser() user: RequestUser,
    @Body() updateDto: UpdateDocumentDto,
  ) {
    return this.documentsService.updateDocument(
      storeId,
      user.id,
      documentId,
      updateDto,
    );
  }

  /**
   * List documents
   * GET /stores/:storeId/documents?type=CONTRACT
   * Requires: Store membership
   */
  @Get()
  async listDocuments(
    @Param('storeId') storeId: string,
    @Query('type') type?: DocumentType,
    @CurrentUser() user?: RequestUser,
  ) {
    if (!user) {
      throw new Error('User not found');
    }
    return this.documentsService.listDocuments(storeId, user.id, type);
  }

  /**
   * Get document detail
   * GET /stores/:storeId/documents/:documentId
   * Requires: Store membership
   */
  @Get(':documentId')
  async getDocument(
    @Param('storeId') storeId: string,
    @Param('documentId') documentId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.documentsService.getDocument(storeId, user.id, documentId);
  }

  /**
   * Acknowledge a document
   * POST /stores/:storeId/documents/:documentId/ack
   * Requires: Store membership (target user only)
   */
  @Post(':documentId/ack')
  async acknowledgeDocument(
    @Param('storeId') storeId: string,
    @Param('documentId') documentId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.documentsService.acknowledgeDocument(
      storeId,
      user.id,
      documentId,
    );
  }
}

