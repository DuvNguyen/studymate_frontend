/**
 * Course related types.
 */

export interface CourseVideo {
  id: number;
  title: string;
  youtubeVideoId?: string;
  duration?: number;
}

export interface CourseLesson {
  id: number;
  title: string;
  isPreview: boolean;
  youtubeVideoId?: string | null;
  video?: CourseVideo | null;
  order?: number;
}

export interface CourseSectionQuiz {
  id: number;
  title: string;
  timeLimit?: number;
  numQuestions?: number;
  passingScore?: number;
}

export interface CourseSection {
  id: number;
  title: string;
  order?: number;
  lessons?: CourseLesson[];
  quiz?: CourseSectionQuiz | null;
}

export interface CourseDetail {
  id: number;
  title: string;
  status: string;
  thumbnailUrl?: string | null;
  rejectionReason?: string | null;
  previewVideo?: CourseVideo | null;
  sections?: CourseSection[];
  finalQuiz?: CourseSectionQuiz | null;
  instructor_name?: string;
}

export interface AdminCourse {
  id: number;
  title: string;
  status: string;
  thumbnailUrl?: string | null;
  instructor_name?: string;
  categoryId?: number;
  price?: number;
  createdAt?: string;
  updatedAt?: string;
  instructor?: { fullName?: string } | null;
  category?: { name?: string } | null;
  sectionCount?: number;
  lessonCount?: number;
  totalDuration?: number;
  slug?: string;
  rejectionReason?: string | null;
}

export interface InstructorCourse {
  id: number;
  title: string;
  slug: string;
  status: string;
  level?: string;
  thumbnailUrl?: string | null;
  price: number;
  sectionCount?: number;
  lessonCount?: number;
  totalStudents?: number;
  totalLessons?: number;
  totalSections?: number;
  category?: { id: number; name: string; slug: string } | null;
  createdAt?: string;
}
