import { create } from 'zustand';
import type { GameAction, GameState, SyncMessage } from './types';
import { gameReducer, isUndoable } from './reducer';
import { initialGameState } from './demoData';
import { clearPersisted, loadPersisted, savePersisted } from './db';

/**
 * ה-Store של חלון האדמין — מקור האמת היחיד של המשחק.
 * כל שינוי: (1) מעדכן את ה-State, (2) משודר לחלון התצוגה, (3) נשמר ל-IndexedDB.
 */

const channel = new BroadcastChannel('trivia-poc');

interface AdminStore {
  game: GameState;
  historyLength: number;
  loaded: boolean;
  dispatch: (action: GameAction) => void;
  undo: () => void;
  resetGame: () => void;
}

let history: GameState[] = [];

export const useAdminStore = create<AdminStore>((set, get) => {
  function commit(next: GameState, persistTick = true) {
    set({ game: next, historyLength: history.length });
    channel.postMessage({ type: 'STATE', state: next } satisfies SyncMessage);
    if (persistTick) void savePersisted({ state: next, history });
  }

  return {
    game: initialGameState(),
    historyLength: 0,
    loaded: false,

    dispatch(action) {
      const prev = get().game;
      const next = gameReducer(prev, action);
      if (next === prev) return;
      if (isUndoable(action)) history.push(prev);
      // טיקים של הטיימר נשמרים לדיסק לכל היותר פעם בשנייה, כדי לא להציף את ה-DB
      const persist = action.type !== 'TICK' || Math.floor(prev.timer.remainingMs / 1000) !== Math.floor(next.timer.remainingMs / 1000);
      commit(next, persist);
    },

    undo() {
      const prev = history.pop();
      if (prev) {
        // הטיימר ממשיך מהמצב הנוכחי — Undo מבטל ניקוד ותור, לא זמן
        const current = get().game;
        commit({ ...prev, timer: current.timer });
      }
    },

    resetGame() {
      history = [];
      void clearPersisted();
      commit(initialGameState());
    },
  };
});

/** טעינת מצב שמור בעליית חלון האדמין — הטיימר חוזר תמיד במצב מושהה */
export async function restoreAdminState(): Promise<void> {
  const persisted = await loadPersisted();
  if (persisted) {
    history = persisted.history ?? [];
    const state = persisted.state;
    if (state.timer.status === 'running') {
      state.timer = { ...state.timer, status: 'paused' };
    }
    useAdminStore.setState({ game: state, historyLength: history.length, loaded: true });
    channel.postMessage({ type: 'STATE', state } satisfies SyncMessage);
    void savePersisted({ state, history });
  } else {
    useAdminStore.setState({ loaded: true });
  }
}

/** מענה לבקשות סנכרון מחלון התצוגה */
channel.addEventListener('message', (e: MessageEvent<SyncMessage>) => {
  if (e.data?.type === 'SYNC_REQUEST') {
    const { game, loaded } = useAdminStore.getState();
    if (loaded) channel.postMessage({ type: 'STATE', state: game } satisfies SyncMessage);
  }
});
