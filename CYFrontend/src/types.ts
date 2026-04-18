
export enum ChallengeDifficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
}

export interface Challenge {
  id: string | number;
  _id?: string;
  title: string;
  description?: string;
  code?: string;
  difficulty: ChallengeDifficulty;
  level?: 'easy' | 'medium' | 'hard';
  hints?: string[];
  challengeDetails?: string;
  recommendation?: string;
  feedback?: string;
  points?: number;
  createdAt?: string;
}

export interface Puzzle {
  id: number;
  title: string;
  tag?: string;
  category: string;
  description: string;
  level?: number;
  hints?: string[];
  active?: boolean;
  scenario?: string;
}

