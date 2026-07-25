import type { GameAction, GameState } from './types';
import { DEMO_QUESTIONS } from './demoData';

/** האם מותר לענות על שאלות במצב הנוכחי (נחסם בהשהיה ובסיום זמן) */
export function answersEnabled(state: GameState): boolean {
  return state.timer.status !== 'paused' && state.timer.status !== 'finished';
}

/** פעולות שנשמרות בהיסטוריית ה-Undo */
export function isUndoable(action: GameAction): boolean {
  return action.type === 'CORRECT' || action.type === 'WRONG' || action.type === 'MANUAL_ADJUST';
}

function advanceTurn(state: GameState): GameState {
  return {
    ...state,
    currentPlayerIdx: (state.currentPlayerIdx + 1) % state.players.length,
    questionIndex: (state.questionIndex + 1) % DEMO_QUESTIONS.length,
    answeredCount: state.answeredCount + 1,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'CORRECT': {
      if (!answersEnabled(state)) return state;
      const players = state.players.map((p, i) =>
        i === state.currentPlayerIdx ? { ...p, score: p.score + 1 } : p,
      );
      return advanceTurn({ ...state, players });
    }
    case 'WRONG': {
      if (!answersEnabled(state)) return state;
      return advanceTurn(state);
    }
    case 'MANUAL_ADJUST': {
      const players = state.players.map((p) =>
        p.id === action.playerId ? { ...p, score: p.score + action.delta } : p,
      );
      return { ...state, players };
    }
    case 'TIMER_START':
      if (state.timer.status !== 'idle') return state;
      return { ...state, timer: { ...state.timer, status: 'running' } };
    case 'TIMER_PAUSE':
      if (state.timer.status !== 'running') return state;
      return { ...state, timer: { ...state.timer, status: 'paused' } };
    case 'TIMER_RESUME':
      if (state.timer.status !== 'paused') return state;
      return { ...state, timer: { ...state.timer, status: 'running' } };
    case 'TIMER_RESET':
      return { ...state, timer: { ...state.timer, remainingMs: state.timer.totalMs, status: 'idle' } };
    case 'TICK': {
      if (state.timer.status !== 'running') return state;
      const remainingMs = Math.max(0, state.timer.remainingMs - action.dtMs);
      return {
        ...state,
        timer: { ...state.timer, remainingMs, status: remainingMs === 0 ? 'finished' : 'running' },
      };
    }
  }
}
