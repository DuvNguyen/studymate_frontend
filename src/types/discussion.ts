/**
 * Discussion related types.
 */

import type { UserRole } from './user';

export interface DiscussionUser {
  id: number;
  fullName?: string;
  avatarUrl?: string | null;
  role?: UserRole | string;
}
