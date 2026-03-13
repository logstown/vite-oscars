import { Timestamp } from 'firebase/firestore'

export type Message = {
  id: string
  text: string
  uid: string
  displayName: string
  photoURL: string | null
  timestamp: Timestamp
}

export type DbUser = {
  uid: string
  displayName: string | null
  photoURL: string | null
  picks: Picks
}

export type Nominee = {
  id: string
  nominee: string
  film: string
}

export type Picks = Record<string, Nominee>

export type Award = {
  id: string
  award: string
  nominees: Nominee[]
  sequence: number
  points: number
  winner: string
  winnerStamp: Timestamp
}

export type Pool = {
  id: string
  name: string
  creator: string
  dateCreated: Timestamp
  users: string[]
}
