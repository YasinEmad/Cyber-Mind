
export enum ChallengeDifficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
}

export interface Challenge {
  id: string | number;
  title: string;
  description?: string;
  difficulty: ChallengeDifficulty;
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

