import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../change-requests/audit.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Role, DocumentType } from '@prisma/client';

/**
 * DocumentsService handles document management operations
 */
@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Create a document
   * @param storeId - Store ID
   * @param userId - User ID (must be OWNER or MANAGER)
   * @param createDto - Document creation data
   * @returns Created document
   */
  async createDocument(
    storeId: string,
    userId: string,
    createDto: CreateDocumentDto,
  ) {
    // Verify user is OWNER or MANAGER
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You must be a member of this store to create documents',
      );
    }

    if (
      membership.role !== Role.OWNER &&
      membership.role !== Role.MANAGER
    ) {
      throw new ForbiddenException(
        'Only OWNER and MANAGER can create documents',
      );
    }

    // Create document with targets
    const result = await this.prisma.$transaction(async (tx) => {
      const document = await tx.document.create({
        data: {
          storeId,
          title: createDto.title,
          type: createDto.type,
          fileUrl: createDto.fileUrl,
          version: 1,
          createdById: userId,
        },
      });

      // Create targets if provided
      if (createDto.targetUserIds && createDto.targetUserIds.length > 0) {
        await tx.documentTarget.createMany({
          data: createDto.targetUserIds.map((targetUserId) => ({
            documentId: document.id,
            userId: targetUserId,
          })),
        });
      }

      return document;
    });

    // Log audit
    await this.auditService.log(
      storeId,
      userId,
      'DOCUMENT_CREATED',
      'Document',
      result.id,
      undefined,
      {
        title: result.title,
        type: result.type,
        targetCount: createDto.targetUserIds?.length || 0,
      },
    );

    // Fetch with targets count
    const document = await this.prisma.document.findUnique({
      where: { id: result.id },
      include: {
        targets: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            targets: true,
          },
        },
      },
    });

    return document;
  }

  /**
   * Update a document
   * @param storeId - Store ID
   * @param userId - User ID (must be OWNER or MANAGER)
   * @param documentId - Document ID
   * @param updateDto - Document update data
   * @returns Updated document
   */
  async updateDocument(
    storeId: string,
    userId: string,
    documentId: string,
    updateDto: UpdateDocumentDto,
  ) {
    // Verify user is OWNER or MANAGER
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You must be a member of this store to update documents',
      );
    }

    if (
      membership.role !== Role.OWNER &&
      membership.role !== Role.MANAGER
    ) {
      throw new ForbiddenException(
        'Only OWNER and MANAGER can update documents',
      );
    }

    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (document.storeId !== storeId) {
      throw new ForbiddenException('Document does not belong to this store');
    }

    // Check if fileUrl changed (triggers version increment)
    const fileUrlChanged = updateDto.fileUrl && updateDto.fileUrl !== document.fileUrl;
    const newVersion = fileUrlChanged ? document.version + 1 : document.version;

    // Update document
    const updated = await this.prisma.$transaction(async (tx) => {
      const doc = await tx.document.update({
        where: { id: documentId },
        data: {
          title: updateDto.title,
          fileUrl: updateDto.fileUrl,
          version: newVersion,
        },
      });

      // Update targets if provided
      if (updateDto.targetUserIds !== undefined) {
        // Delete existing targets
        await tx.documentTarget.deleteMany({
          where: { documentId },
        });

        // Create new targets
        if (updateDto.targetUserIds.length > 0) {
          await tx.documentTarget.createMany({
            data: updateDto.targetUserIds.map((targetUserId) => ({
              documentId,
              userId: targetUserId,
            })),
          });
        }
      }

      return doc;
    });

    // Log audit
    await this.auditService.log(
      storeId,
      userId,
      'DOCUMENT_UPDATED',
      'Document',
      documentId,
      {
        version: document.version,
        fileUrl: document.fileUrl,
      },
      {
        version: updated.version,
        fileUrl: updated.fileUrl,
      },
    );

    return updated;
  }

  /**
   * List documents
   * @param storeId - Store ID
   * @param userId - User ID (requester)
   * @param type - Filter by type (optional)
   * @returns List of documents
   */
  async listDocuments(
    storeId: string,
    userId: string,
    type?: DocumentType,
  ) {
    // Verify user is a member
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You must be a member of this store to view documents',
      );
    }

    // Build where clause
    const where: any = {
      storeId,
    };

    if (type) {
      where.type = type;
    }

    // Workers can only see documents where they are targets
    if (membership.role === Role.WORKER) {
      where.targets = {
        some: {
          userId,
        },
      };
    }

    const documents = await this.prisma.document.findMany({
      where,
      include: {
        targets: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            targets: true,
            acks: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get user's acks for these documents
    const documentIds = documents.map((d) => d.id);
    const userAcks = await this.prisma.documentAck.findMany({
      where: {
        documentId: { in: documentIds },
        userId,
      },
    });

    const ackMap = new Map(
      userAcks.map((ack) => [`${ack.documentId}-${ack.version}`, ack]),
    );

    // Add acknowledgment status
    return documents.map((doc) => {
      const ackKey = `${doc.id}-${doc.version}`;
      const ack = ackMap.get(ackKey);
      return {
        ...doc,
        acknowledgedCurrentVersion: !!ack,
        currentVersion: doc.version,
      };
    });
  }

  /**
   * Get document detail
   * @param storeId - Store ID
   * @param userId - User ID (requester)
   * @param documentId - Document ID
   * @returns Document detail
   */
  async getDocument(storeId: string, userId: string, documentId: string) {
    // Verify user is a member
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You must be a member of this store to view documents',
      );
    }

    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: {
        targets: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (document.storeId !== storeId) {
      throw new ForbiddenException('Document does not belong to this store');
    }

    // Workers can only see documents where they are targets
    if (membership.role === Role.WORKER) {
      const isTarget = document.targets.some((t) => t.userId === userId);
      if (!isTarget) {
        throw new ForbiddenException(
          'You can only view documents assigned to you',
        );
      }
    }

    // Get user's ack for current version
    const ack = await this.prisma.documentAck.findUnique({
      where: {
        documentId_userId_version: {
          documentId,
          userId,
          version: document.version,
        },
      },
    });

    return {
      ...document,
      acknowledgedCurrentVersion: !!ack,
      currentVersion: document.version,
      ack: ack || null,
    };
  }

  /**
   * Acknowledge a document
   * @param storeId - Store ID
   * @param userId - User ID (must be target user)
   * @param documentId - Document ID
   * @returns Acknowledgment
   */
  async acknowledgeDocument(
    storeId: string,
    userId: string,
    documentId: string,
  ) {
    // Verify user is a member
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You must be a member of this store to acknowledge documents',
      );
    }

    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: {
        targets: true,
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (document.storeId !== storeId) {
      throw new ForbiddenException('Document does not belong to this store');
    }

    // Verify user is a target
    const isTarget = document.targets.some((t) => t.userId === userId);
    if (!isTarget) {
      throw new ForbiddenException(
        'You can only acknowledge documents assigned to you',
      );
    }

    // Upsert ack (create or update if exists)
    const ack = await this.prisma.documentAck.upsert({
      where: {
        documentId_userId_version: {
          documentId,
          userId,
          version: document.version,
        },
      },
      create: {
        documentId,
        userId,
        version: document.version,
      },
      update: {
        acknowledgedAt: new Date(),
      },
    });

    // Log audit
    await this.auditService.log(
      storeId,
      userId,
      'DOCUMENT_ACKED',
      'DocumentAck',
      `${documentId}-${userId}-${document.version}`,
      undefined,
      {
        documentId,
        version: document.version,
      },
    );

    return ack;
  }
}

