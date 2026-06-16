/**
 * Quiz related types.
 */

export interface QuizQuestion {
  id?: number;
  content: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface QuizSettings {
  id?: number;
  title: string;
  timeLimit?: number;
  numQuestions?: number;
  passingScore?: number;
  questions?: QuizQuestion[];
  bankId?: number;
  difficulty?: string | null;
  numEasy?: number;
  numMedium?: number;
  numHard?: number;
}
