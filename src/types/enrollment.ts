/**
 * Enrollment & Purchase related types.
 */

export interface RefundRequestSummary {
  id?: number;
  status?: string;
  reason?: string;
  created_at?: string;
}

export interface OrderItem {
  final_price?: number;
  commission_rate?: number;
  platform_fee?: number;
  instructor_amount?: number;
  order?: {
    order_number?: string;
    student?: {
      full_name?: string;
      email?: string;
      profile?: {
        fullName?: string;
      };
    };
  };
  course?: {
    title?: string;
  };
}

export interface Enrollment {
  id: number;
  course_id: number;
  is_active: boolean;
  enrolled_at: string;
  progress_percent: number;
  refund_request?: RefundRequestSummary | null;
  course: {
    id: number;
    title: string;
    instructor_name?: string;
    slug?: string;
    thumbnailUrl?: string | null;
    status?: string;
  };
  order_item?: OrderItem | null;
}
