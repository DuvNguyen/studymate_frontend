/**
 * User & Auth related types.
 */

export interface UserRole {
  roleName: string;
}

export interface CurrentUserProfile {
  fullName?: string;
}

export interface MinimalUser {
  id: number;
  fullName?: string | null;
  email?: string;
  avatarUrl?: string | null;
  role?: UserRole | string;
}
