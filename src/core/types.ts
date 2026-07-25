export interface Player {
  id: string;
  name: string;
  score: number;
}

export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished';

export interface TimerState {
  totalMs: number;
  remainingMs: number;
  status: TimerStatus;
}

export interface GameState {
  players: Player[];
  currentPlayerIdx: number;
  questionIndex: number;
  answeredCount: number;
  timer: TimerState;
}

export type GameAction =
  | { type: 'CORRECT' }
  | { type: 'WRONG' }
  | { type: 'MANUAL_ADJUST'; playerId: string; delta: number }
  | { type: 'TIMER_START' }
  | { type: 'TIMER_PAUSE' }
  | { type: 'TIMER_RESUME' }
  | { type: 'TIMER_RESET' }
  | { type: 'TICK'; dtMs: number };

/** ההודעות העוברות בין חלון האדמין לחלון התצוגה */
export type SyncMessage =
  | { type: 'STATE'; state: GameState }
  | { type: 'SYNC_REQUEST' };
