import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from './audit.service';
import { ApplyCandidateDto } from './dto/apply-candidate.dto';
import { ChangeRequestType, ChangeRequestStatus } from '@prisma/client';

/**
 * CandidatesService handles cover request candidate operations
 */
@Injectable()
export class CandidatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Apply as a candidate for a cover request
   * @param storeId - Store ID
   * @param userId - User ID (applicant)
   * @param requestId - Change request ID
   * @param applyDto - Application data
   * @returns Created candidate
   */
  async applyCandidate(
    storeId: string,
    userId: string,
    requestId: string,
    applyDto: ApplyCandidateDto,
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
        'You must be a member of this store to apply as a candidate',
      );
    }

    // Get request
    const request = await this.prisma.changeRequest.findUnique({
      where: { id: requestId },
      include: {
        shift: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Change request not found');
    }

    if (request.storeId !== storeId) {
      throw new ForbiddenException(
        'Change request does not belong to this store',
      );
    }

    // Verify request is COVER_REQUEST
    if (request.type !== ChangeRequestType.SHIFT_COVER_REQUEST) {
      throw new BadRequestException(
        'Candidates can only be applied to COVER_REQUEST type',
      );
    }

    // Verify request is still PENDING
    if (request.status !== ChangeRequestStatus.PENDING) {
      throw new BadRequestException(
        'Cannot apply to a change request that is not pending',
      );
    }

    // Request creator cannot apply as candidate
    if (request.createdById === userId) {
      throw new BadRequestException(
        'You cannot apply as a candidate for your own cover request',
      );
    }

    // Check if already applied
    const existing = await this.prisma.changeRequestCandidate.findUnique({
      where: {
        requestId_userId: {
          requestId,
          userId,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        'You have already applied as a candidate for this request',
      );
    }

    // Create candidate
    const candidate = await this.prisma.changeRequestCandidate.create({
      data: {
        requestId,
        userId,
        note: applyDto.note,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        request: {
          include: {
            shift: {
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
          },
        },
      },
    });

    // Log audit
    await this.auditService.log(
      storeId,
      userId,
      'COVER_CANDIDATE_APPLIED',
      'ChangeRequestCandidate',
      candidate.id,
      undefined,
      {
        requestId,
        userId,
      },
    );

    return candidate;
  }

  /**
   * List candidates for a cover request
   * @param storeId - Store ID
   * @param userId - User ID (requester)
   * @param requestId - Change request ID
   * @returns List of candidates
   */
  async listCandidates(storeId: string, userId: string, requestId: string) {
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
        'You must be a member of this store to view candidates',
      );
    }

    const request = await this.prisma.changeRequest.findUnique({
      where: { id: requestId },
      include: {
        shift: true,
        candidates: {
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
      },
    });

    if (!request) {
      throw new NotFoundException('Change request not found');
    }

    if (request.storeId !== storeId) {
      throw new ForbiddenException(
        'Change request does not belong to this store',
      );
    }

    // Workers can only see candidates if they are the requester or a candidate themselves
    if (membership.role === 'WORKER') {
      const isRequester = request.createdById === userId;
      const isCandidate = request.candidates.some(
        (c) => c.userId === userId,
      );

      if (!isRequester && !isCandidate) {
        throw new ForbiddenException(
          'You can only view candidates for your own requests or requests you are a candidate for',
        );
      }

      // If user is a candidate, only show their own application
      if (isCandidate && !isRequester) {
        return request.candidates.filter((c) => c.userId === userId);
      }
    }

    // Manager/Owner can see all candidates
    return request.candidates;
  }
}
