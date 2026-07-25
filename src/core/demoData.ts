import type { GameState, Player } from './types';

export const DEMO_PLAYERS: Player[] = [
  { id: 'p1', name: 'אברהם כהן', score: 0 },
  { id: 'p2', name: 'יוסף לוי', score: 0 },
  { id: 'p3', name: 'משה פרידמן', score: 0 },
  { id: 'p4', name: 'דוד שוורץ', score: 0 },
  { id: 'p5', name: 'יעקב גולדברג', score: 0 },
];

export const DEMO_QUESTIONS: string[] = [
  'מהי בירת צרפת?',
  'כמה רגליים יש לעכביש?',
  'מי חיבר את "התקווה"?',
  'באיזו שנה קמה מדינת ישראל?',
  'מהו ההר הגבוה בעולם?',
  'כמה שחקנים בקבוצת כדורגל על המגרש?',
  'מהי היבשת הגדולה בעולם?',
  'איזה צבע מתקבל מערבוב כחול וצהוב?',
  'כמה ימים יש בשנה מעוברת?',
  'מהו האוקיינוס הגדול בעולם?',
];

export const TIMER_TOTAL_MS = 2 * 60 * 1000;

export function initialGameState(): GameState {
  return {
    players: DEMO_PLAYERS.map((p) => ({ ...p })),
    currentPlayerIdx: 0,
    questionIndex: 0,
    answeredCount: 0,
    timer: { totalMs: TIMER_TOTAL_MS, remainingMs: TIMER_TOTAL_MS, status: 'idle' },
  };
}
