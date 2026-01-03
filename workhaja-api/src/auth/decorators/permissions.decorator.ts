import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export type ManagerPermission =
  | 'manageShifts'
  | 'manageSchedule'
  | 'manageDocuments'
  | 'reviewSubmissions'
  | 'approveRequests'
  | 'viewReports'
  | 'inviteMembers';

/**
 * Decorator to specify required permissions for MANAGER role
 * OWNER always has all permissions
 */
export const RequirePermission = (...permissions: ManagerPermission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

