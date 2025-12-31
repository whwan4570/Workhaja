import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../change-requests/audit.service';
import { SubmitSubmissionDto } from './dto/submit-submission.dto';
import { ReviewSubmissionDto } from './dto/review-submission.dto';
import {
  Role,
  DocumentType,
  SubmissionStatus,
} from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

/**
 * SubmissionsService handles document submission operations
 * 
 * Expiration Policy:
 * - EXPIRED status is derived (not stored) in MVP
 * - Status remains APPROVED/SUBMITTED, but API calculates expiresAt <= now as EXPIRED
 * - Future batch job can update status to EXPIRED if needed
 */
@Injectable()
export class SubmissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Submit a document submission
   * @param storeId - Store ID
   * @param userId - User ID (requester, must be the submitter)
   * @param submitDto - Submission data
   * @returns Created or updated submission
   */
  async submitSubmission(
    storeId: string,
    userId: string,
    submitDto: SubmitSubmissionDto,
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
        'You must be a member of this store to submit documents',
      );
    }

    // Validate expiresAt for required types
    if (
      (submitDto.type === DocumentType.HEALTH_CERT ||
        submitDto.type === DocumentType.HYGIENE_TRAINING) &&
      !submitDto.expiresAt
    ) {
      throw new BadRequestException(
        `expiresAt is required for ${submitDto.type} submissions`,
      );
    }

    // Validate dates
    if (submitDto.issuedAt && submitDto.expiresAt) {
      const issuedDate = new Date(submitDto.issuedAt);
      const expiresDate = new Date(submitDto.expiresAt);
      if (expiresDate <= issuedDate) {
        throw new BadRequestException(
          'expiresAt must be after issuedAt',
        );
      }
    }

    // Find existing submission of same type
    const existing = await this.prisma.documentSubmission.findFirst({
      where: {
        storeId,
        userId,
        type: submitDto.type,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    let submission;
    if (existing) {
      // Update existing submission
      submission = await this.prisma.documentSubmission.update({
        where: { id: existing.id },
        data: {
          fileUrl: submitDto.fileUrl,
          issuedAt: submitDto.issuedAt ? new Date(submitDto.issuedAt) : null,
          expiresAt: submitDto.expiresAt ? new Date(submitDto.expiresAt) : null,
          status: SubmissionStatus.SUBMITTED,
          reviewedById: null,
          reviewedAt: null,
          note: null,
        },
      });
    } else {
      // Create new submission
      submission = await this.prisma.documentSubmission.create({
        data: {
          storeId,
          userId,
          type: submitDto.type,
          fileUrl: submitDto.fileUrl,
          issuedAt: submitDto.issuedAt ? new Date(submitDto.issuedAt) : null,
          expiresAt: submitDto.expiresAt ? new Date(submitDto.expiresAt) : null,
          status: SubmissionStatus.SUBMITTED,
        },
      });
    }

    // Log audit
    await this.auditService.log(
      storeId,
      userId,
      'SUBMISSION_SUBMITTED',
      'DocumentSubmission',
      submission.id,
      existing ? { status: existing.status } : undefined,
      {
        type: submission.type,
        status: SubmissionStatus.SUBMITTED,
      },
    );

    return submission;
  }

  /**
   * List user's own submissions
   * @param storeId - Store ID
   * @param userId - User ID (requester)
   * @returns List of submissions with derived expiration status
   */
  async listMySubmissions(storeId: string, userId: string) {
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
        'You must be a member of this store to view submissions',
      );
    }

    const submissions = await this.prisma.documentSubmission.findMany({
      where: {
        storeId,
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Add derived expiration status
    const now = new Date();
    return submissions.map((sub) => {
      let derivedStatus = sub.status;
      let isExpiringSoon = false;
      let isExpired = false;

      if (sub.expiresAt) {
        const expiresDate = new Date(sub.expiresAt);
        isExpired = expiresDate <= now;
        isExpiringSoon =
          expiresDate > now &&
          expiresDate <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

        if (isExpired) {
          derivedStatus = SubmissionStatus.EXPIRED;
        }
      }

      return {
        ...sub,
        derivedStatus,
        isExpiringSoon,
        isExpired,
      };
    });
  }

  /**
   * List submissions (admin dashboard)
   * @param storeId - Store ID
   * @param userId - User ID (requester, must be OWNER or MANAGER)
   * @param type - Filter by type (optional)
   * @param status - Filter by status (optional)
   * @param missing - Include missing submissions (optional)
   * @returns List of submissions and missing users
   */
  async listSubmissions(
    storeId: string,
    userId: string,
    type?: DocumentType,
    status?: SubmissionStatus,
    missing?: boolean,
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
        'You must be a member of this store to view submissions',
      );
    }

    if (
      membership.role !== Role.OWNER &&
      membership.role !== Role.MANAGER
    ) {
      throw new ForbiddenException(
        'Only OWNER and MANAGER can view all submissions',
      );
    }

    // Build where clause
    const where: any = {
      storeId,
    };

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    // Get submissions
    const submissions = await this.prisma.documentSubmission.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Add derived expiration status
    const now = new Date();
    const enrichedSubmissions = submissions.map((sub) => {
      let derivedStatus = sub.status;
      let isExpiringSoon = false;
      let isExpired = false;

      if (sub.expiresAt) {
        const expiresDate = new Date(sub.expiresAt);
        isExpired = expiresDate <= now;
        isExpiringSoon =
          expiresDate > now &&
          expiresDate <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        if (isExpired) {
          derivedStatus = SubmissionStatus.EXPIRED;
        }
      }

      return {
        ...sub,
        derivedStatus,
        isExpiringSoon,
        isExpired,
      };
    });

    // Get missing submissions if requested
    let missingUsers: any[] = [];
    if (missing && type) {
      // Get all store members
      const members = await this.prisma.membership.findMany({
        where: { storeId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      // Get users who have submissions of this type
      const usersWithSubmissions = new Set(
        submissions.map((s) => s.userId),
      );

      // Find missing users
      missingUsers = members
        .filter((m) => !usersWithSubmissions.has(m.user.id))
        .map((m) => ({
          userId: m.user.id,
          name: m.user.name,
          email: m.user.email,
          missingType: type,
        }));
    }

    return {
      submissions: enrichedSubmissions,
      missing: missingUsers,
    };
  }

  /**
   * Approve a submission
   * @param storeId - Store ID
   * @param userId - User ID (reviewer, must be OWNER or MANAGER)
   * @param submissionId - Submission ID
   * @param reviewDto - Review data
   * @returns Approved submission
   */
  async approveSubmission(
    storeId: string,
    userId: string,
    submissionId: string,
    reviewDto: ReviewSubmissionDto,
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
        'You must be a member of this store to approve submissions',
      );
    }

    if (
      membership.role !== Role.OWNER &&
      membership.role !== Role.MANAGER
    ) {
      throw new ForbiddenException(
        'Only OWNER and MANAGER can approve submissions',
      );
    }

    const submission = await this.prisma.documentSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.storeId !== storeId) {
      throw new ForbiddenException(
        'Submission does not belong to this store',
      );
    }

    const updated = await this.prisma.documentSubmission.update({
      where: { id: submissionId },
      data: {
        status: SubmissionStatus.APPROVED,
        reviewedById: userId,
        reviewedAt: new Date(),
        note: reviewDto.decisionNote,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // Log audit
    await this.auditService.log(
      storeId,
      userId,
      'SUBMISSION_APPROVED',
      'DocumentSubmission',
      submissionId,
      { status: submission.status },
      { status: SubmissionStatus.APPROVED },
    );

    // Notify submitter of approval
    try {
      await this.notificationsService.enqueueInAppNotification({
        storeId,
        userId: submission.userId,
        type: 'DOC_EXPIRING_SOON', // Reuse type for now, or create new type
        title: 'Submission Approved',
        message: `Your ${submission.type} submission has been approved`,
        data: {
          submissionId: submission.id,
          type: submission.type,
          status: 'APPROVED',
        },
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }

    return updated;
  }

  /**
   * Reject a submission
   * @param storeId - Store ID
   * @param userId - User ID (reviewer, must be OWNER or MANAGER)
   * @param submissionId - Submission ID
   * @param reviewDto - Review data
   * @returns Rejected submission
   */
  async rejectSubmission(
    storeId: string,
    userId: string,
    submissionId: string,
    reviewDto: ReviewSubmissionDto,
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
        'You must be a member of this store to reject submissions',
      );
    }

    if (
      membership.role !== Role.OWNER &&
      membership.role !== Role.MANAGER
    ) {
      throw new ForbiddenException(
        'Only OWNER and MANAGER can reject submissions',
      );
    }

    const submission = await this.prisma.documentSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.storeId !== storeId) {
      throw new ForbiddenException(
        'Submission does not belong to this store',
      );
    }

    const updated = await this.prisma.documentSubmission.update({
      where: { id: submissionId },
      data: {
        status: SubmissionStatus.REJECTED,
        reviewedById: userId,
        reviewedAt: new Date(),
        note: reviewDto.decisionNote,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // Log audit
    await this.auditService.log(
      storeId,
      userId,
      'SUBMISSION_REJECTED',
      'DocumentSubmission',
      submissionId,
      { status: submission.status },
      { status: SubmissionStatus.REJECTED },
    );

    // Notify submitter of rejection
    try {
      await this.notificationsService.enqueueInAppNotification({
        storeId,
        userId: submission.userId,
        type: 'DOC_EXPIRING_SOON', // Reuse type for now
        title: 'Submission Rejected',
        message: `Your ${submission.type} submission has been rejected${reviewDto.decisionNote ? ': ' + reviewDto.decisionNote : ''}`,
        data: {
          submissionId: submission.id,
          type: submission.type,
          status: 'REJECTED',
        },
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }

    return updated;
  }

  /**
   * Get expiring submissions
   * @param storeId - Store ID
   * @param userId - User ID (requester, must be OWNER or MANAGER)
   * @param type - Filter by type (optional)
   * @param days - Days threshold (default: 30)
   * @returns List of expiring submissions
   */
  async getExpiringSubmissions(
    storeId: string,
    userId: string,
    type?: DocumentType,
    days: number = 30,
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
        'You must be a member of this store to view expiring submissions',
      );
    }

    if (
      membership.role !== Role.OWNER &&
      membership.role !== Role.MANAGER
    ) {
      throw new ForbiddenException(
        'Only OWNER and MANAGER can view expiring submissions',
      );
    }

    const now = new Date();
    const threshold = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const where: any = {
      storeId,
      expiresAt: {
        lte: threshold,
        gt: now,
      },
    };

    if (type) {
      where.type = type;
    }

    const submissions = await this.prisma.documentSubmission.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        expiresAt: 'asc',
      },
    });

    return submissions;
  }

  /**
   * Get expired submissions
   * @param storeId - Store ID
   * @param userId - User ID (requester, must be OWNER or MANAGER)
   * @param type - Filter by type (optional)
   * @returns List of expired submissions
   */
  async getExpiredSubmissions(
    storeId: string,
    userId: string,
    type?: DocumentType,
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
        'You must be a member of this store to view expired submissions',
      );
    }

    if (
      membership.role !== Role.OWNER &&
      membership.role !== Role.MANAGER
    ) {
      throw new ForbiddenException(
        'Only OWNER and MANAGER can view expired submissions',
      );
    }

    const now = new Date();

    const where: any = {
      storeId,
      expiresAt: {
        lte: now,
      },
    };

    if (type) {
      where.type = type;
    }

    const submissions = await this.prisma.documentSubmission.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        expiresAt: 'asc',
      },
    });

    return submissions;
  }
}

