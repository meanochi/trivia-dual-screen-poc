import { useEffect, useRef, useState } from 'react';
import type { GameState, SyncMessage } from '../core/types';
import { DEMO_QUESTIONS } from '../core/demoData';
import { formatTime } from '../core/format';

/**
 * מסך הקהל — "ראי" בלבד. לא מריץ לוגיקה: מקבל את מצב המשחק המלא
 * מחלון האדמין דרך BroadcastChannel ומרנדר אותו.
 */
export default function DisplayScreen() {
  const [game, setGame] = useState<GameState | null>(null);
  const prevScoresRef = useRef<Map<string, number>>(new Map());
  const [bumped, setBumped] = useState<Set<string>>(new Set());

  useEffect(() => {
    const channel = new BroadcastChannel('trivia-poc');
    channel.addEventListener('message', (e: MessageEvent<SyncMessage>) => {
      if (e.data?.type === 'STATE') setGame(e.data.state);
    });
    channel.postMessage({ type: 'SYNC_REQUEST' } satisfies SyncMessage);
    return () => channel.close();
  }, []);

  // אנימציית "קפיצה" לניקוד שהשתנה
  useEffect(() => {
    if (!game) return;
    const changed = new Set<string>();
    for (const p of game.players) {
      const prev = prevScoresRef.current.get(p.id);
      if (prev !== undefined && prev !== p.score) changed.add(p.id);
      prevScoresRef.current.set(p.id, p.score);
    }
    if (changed.size > 0) {
      setBumped(changed);
      const t = setTimeout(() => setBumped(new Set()), 600);
      return () => clearTimeout(t);
    }
  }, [game]);

  if (!game) {
    return (
      <div className="display waiting">
        <div className="logo-text">פונקט פארקערט</div>
        <div className="waiting-note">ממתין לחיבור למסך הניהול…</div>
      </div>
    );
  }

  const activePlayer = game.players[game.currentPlayerIdx];
  const { timer } = game;
  const showTimer = timer.status !== 'idle';

  return (
    <div className="display">
      <header className="display-header">
        <div className="logo-text small">פונקט פארקערט</div>
        {showTimer && (
          <div className={`display-timer ${timer.status} ${timer.remainingMs <= 10_000 && timer.status === 'running' ? 'urgent' : ''}`}>
            {formatTime(timer.remainingMs)}
            {timer.status === 'paused' && <span className="pause-badge">הפסקה</span>}
            {timer.status === 'finished' && <span className="pause-badge">הזמן נגמר!</span>}
          </div>
        )}
      </header>

      <main className="display-main">
        <div className="display-question">{DEMO_QUESTIONS[game.questionIndex]}</div>
        <div className="display-turn">
          בתור: <strong>{activePlayer.name}</strong>
        </div>
      </main>

      <aside className="display-scores">
        {game.players.map((p, i) => (
          <div key={p.id} className={`score-row ${i === game.currentPlayerIdx ? 'active' : ''}`}>
            <span className="score-name">{p.name}</span>
            <span className={`score-value ${bumped.has(p.id) ? 'bump' : ''}`}>{p.score}</span>
          </div>
        ))}
      </aside>
    </div>
  );
}
