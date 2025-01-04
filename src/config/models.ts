export type DbUser = {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  picks: Picks;
  points: number;
  gotLastAwardCorrect: boolean;
};

export type Nominee = {
  id: string;
  nominee: string;
  film: string;
};

export type Picks = Record<string, Nominee>;

export type Award = {
  id: string;
  award: string;
  nominees: Nominee[];
  sequence: number;
  points: number;
  winnder: string;
  winnerStamp: any;
};
