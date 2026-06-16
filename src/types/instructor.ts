/**
 * Instructor Portfolio related types.
 */

export interface PortfolioCertificate {
  id: number;
  name: string;
  url?: string;
}

export interface PortfolioCourse {
  id: number;
  title: string;
  slug: string;
  thumbnailUrl?: string | null;
  status?: string;
  price?: number;
  level?: string;
  categoryName?: string | null;
}
