
export enum ChallengeDifficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
}

export interface Challenge {
  id: number;
  title: string;
  difficulty: ChallengeDifficulty;
}

export interface LeaderboardUser {
  rank: number;
  username: string;
  avatar: string;
  score: number;
}

export interface Puzzle {
  _id: string;
  title: string;
  tag?: string;
  category: string;
  description: string;
  level?: number;
  hints?: string[];
  active?: boolean;
  scenario?: string;
}

