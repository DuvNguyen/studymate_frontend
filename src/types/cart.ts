/**
 * Cart related types.
 */

export interface CartCourse {
  id: number;
  title: string;
  thumbnailUrl?: string | null;
  price?: number;
  instructor_name?: string;
}

export interface CartItem {
  id: number;
  course_id: number;
  course?: CartCourse;
}

export interface Cart {
  id: number;
  student_id: number;
  cart_items: CartItem[];
}
