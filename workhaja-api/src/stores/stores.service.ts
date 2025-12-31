import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { Role } from '@prisma/client';

/**
 * Store data returned in responses
 */
export interface StoreResponse {
  id: string;
  name: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
  role?: Role; // User's role in this store (for list endpoints)
}

/**
 * Membership data returned in responses
 */
export interface MembershipResponse {
  id: string;
  userId: string;
  storeId: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

/**
 * StoresService handles all store-related operations.
 */
@Injectable()
export class StoresService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Create a new store and assign the creator as OWNER
   * @param userId - ID of the user creating the store
   * @param createStoreDto - Store creation data
   * @returns Created store
   */
  async createStore(
    userId: string,
    createStoreDto: CreateStoreDto,
  ): Promise<StoreResponse> {
    const { name, timezone = 'America/New_York' } = createStoreDto;

    // Create store and membership in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create store
      const store = await tx.store.create({
        data: {
          name,
          timezone,
        },
      });

      // Create OWNER membership
      await tx.membership.create({
        data: {
          userId,
          storeId: store.id,
          role: Role.OWNER,
        },
      });

      return store;
    });

    return {
      id: result.id,
      name: result.name,
      timezone: result.timezone,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  /**
   * Get all stores where the user is a member
   * @param userId - User ID
   * @returns List of stores with user's role
   */
  async getUserStores(userId: string): Promise<StoreResponse[]> {
    const memberships = await this.prisma.membership.findMany({
      where: {
        userId,
      },
      include: {
        store: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return memberships.map((membership) => ({
      id: membership.store.id,
      name: membership.store.name,
      timezone: membership.store.timezone,
      createdAt: membership.store.createdAt,
      updatedAt: membership.store.updatedAt,
      role: membership.role,
    }));
  }

  /**
   * Get store by ID
   * @param storeId - Store ID
   * @returns Store
   * @throws NotFoundException if store not found
   */
  async getStoreById(storeId: string): Promise<StoreResponse> {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return {
      id: store.id,
      name: store.name,
      timezone: store.timezone,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
    };
  }

  /**
   * Add a user to a store as a member
   * @param storeId - Store ID
   * @param userId - ID of the user adding the member (must be OWNER or MANAGER)
   * @param createMembershipDto - Membership creation data
   * @returns Created membership
   * @throws NotFoundException if user not found
   * @throws BadRequestException if user is already a member
   * @throws ForbiddenException if requester doesn't have permission
   */
  async createMembership(
    storeId: string,
    userId: string,
    createMembershipDto: CreateMembershipDto,
  ): Promise<MembershipResponse> {
    const { email, role } = createMembershipDto;

    // Verify store exists
    await this.getStoreById(storeId);

    // Find user by email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is already a member
    const existingMembership = await this.prisma.membership.findUnique({
      where: {
        userId_storeId: {
          userId: user.id,
          storeId: storeId,
        },
      },
    });

    if (existingMembership) {
      throw new BadRequestException('User is already a member of this store');
    }

    // Verify requester has permission (OWNER or MANAGER)
    const requesterMembership = await this.prisma.membership.findUnique({
      where: {
        userId_storeId: {
          userId: userId,
          storeId: storeId,
        },
      },
    });

    if (!requesterMembership) {
      throw new ForbiddenException(
        'You must be a member of this store to add members',
      );
    }

    if (
      requesterMembership.role !== Role.OWNER &&
      requesterMembership.role !== Role.MANAGER
    ) {
      throw new ForbiddenException(
        'Only OWNER and MANAGER can add members to the store',
      );
    }

    // Create membership
    const membership = await this.prisma.membership.create({
      data: {
        userId: user.id,
        storeId: storeId,
        role: role,
      },
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

    return {
      id: membership.id,
      userId: membership.userId,
      storeId: membership.storeId,
      role: membership.role,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
      user: {
        id: membership.user.id,
        email: membership.user.email,
        name: membership.user.name,
      },
    };
  }

  /**
   * Get user's membership in a specific store
   * @param userId - User ID
   * @param storeId - Store ID
   * @returns Membership with user and store info
   * @throws NotFoundException if membership not found
   */
  async getMembership(
    userId: string,
    storeId: string,
  ): Promise<MembershipResponse> {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_storeId: {
          userId: userId,
          storeId: storeId,
        },
      },
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

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    return {
      id: membership.id,
      userId: membership.userId,
      storeId: membership.storeId,
      role: membership.role,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
      user: {
        id: membership.user.id,
        email: membership.user.email,
        name: membership.user.name,
      },
    };
  }

  /**
   * Get all members of a store
   * @param storeId - Store ID
   * @returns List of memberships with user info
   */
  async getStoreMembers(storeId: string): Promise<MembershipResponse[]> {
    // Verify store exists
    await this.getStoreById(storeId);

    const memberships = await this.prisma.membership.findMany({
      where: {
        storeId: storeId,
      },
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
        createdAt: 'desc',
      },
    });

    return memberships.map((membership) => ({
      id: membership.id,
      userId: membership.userId,
      storeId: membership.storeId,
      role: membership.role,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
      user: {
        id: membership.user.id,
        email: membership.user.email,
        name: membership.user.name,
      },
    }));
  }
}

