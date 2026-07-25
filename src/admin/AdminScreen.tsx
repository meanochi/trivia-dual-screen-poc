import { useEffect, useRef, useState } from 'react';
import { restoreAdminState, useAdminStore } from '../core/adminStore';
import { answersEnabled } from '../core/reducer';
import { DEMO_QUESTIONS } from '../core/demoData';
import { formatTime } from '../core/format';

export default function AdminScreen() {
  const { game, historyLength, loaded, dispatch, undo, resetGame } = useAdminStore();
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    void restoreAdminState();
  }, []);

  // לולאת הטיימר — רצה רק בחלון האדמין, לפי זמן אמת (Date.now) ולא לפי מרווחי interval
  const lastTickRef = useRef<number | null>(null);
  const running = game.timer.status === 'running';
  useEffect(() => {
    if (!running) {
      lastTickRef.current = null;
      return;
    }
    lastTickRef.current = Date.now();
    const id = setInterval(() => {
      const now = Date.now();
      const dtMs = now - (lastTickRef.current ?? now);
      lastTickRef.current = now;
      useAdminStore.getState().dispatch({ type: 'TICK', dtMs });
    }, 200);
    return () => clearInterval(id);
  }, [running]);

  if (!loaded) return <div className="admin loading">טוען…</div>;

  const canAnswer = answersEnabled(game);
  const activePlayer = game.players[game.currentPlayerIdx];
  const { timer } = game;

  return (
    <div className="admin">
      <header className="admin-header">
        <h1>מסך ניהול — POC</h1>
        <div className="header-actions">
          <button className="btn btn-undo" onClick={undo} disabled={historyLength === 0}>
            ⟲ חזור ({historyLength})
          </button>
          {confirmReset ? (
            <span className="confirm-reset">
              בטוח לאפס?
              <button className="btn btn-danger" onClick={() => { resetGame(); setConfirmReset(false); }}>כן, אפס</button>
              <button className="btn" onClick={() => setConfirmReset(false)}>ביטול</button>
            </span>
          ) : (
            <button className="btn btn-danger-outline" onClick={() => setConfirmReset(true)}>איפוס משחק</button>
          )}
        </div>
      </header>

      <section className="panel timer-panel">
        <div className={`timer-value ${timer.status}`}>{formatTime(timer.remainingMs)}</div>
        <div className="timer-controls">
          {timer.status === 'idle' && (
            <button className="btn btn-primary" onClick={() => dispatch({ type: 'TIMER_START' })}>▶ התחל טיימר</button>
          )}
          {timer.status === 'running' && (
            <button className="btn btn-warning" onClick={() => dispatch({ type: 'TIMER_PAUSE' })}>⏸ השהה</button>
          )}
          {timer.status === 'paused' && (
            <button className="btn btn-primary" onClick={() => dispatch({ type: 'TIMER_RESUME' })}>▶ המשך משחק</button>
          )}
          {(timer.status === 'paused' || timer.status === 'finished') && (
            <button className="btn" onClick={() => dispatch({ type: 'TIMER_RESET' })}>↺ איפוס טיימר</button>
          )}
        </div>
        {timer.status === 'paused' && <div className="pause-note">המשחק מושהה — כפתורי התשובות חסומים</div>}
        {timer.status === 'finished' && <div className="pause-note">הזמן נגמר</div>}
      </section>

      <section className="panel question-panel">
        <div className="question-meta">
          שאלה {game.answeredCount + 1} · בתור: <strong>{activePlayer.name}</strong>
        </div>
        <div className="question-text">{DEMO_QUESTIONS[game.questionIndex]}</div>
        <div className="answer-buttons">
          <button className="btn btn-correct" disabled={!canAnswer} onClick={() => dispatch({ type: 'CORRECT' })}>
            ✔ נכון (+1)
          </button>
          <button className="btn btn-wrong" disabled={!canAnswer} onClick={() => dispatch({ type: 'WRONG' })}>
            ✘ שגוי
          </button>
        </div>
      </section>

      <section className="panel players-panel">
        <h2>פאנל ניקוד ידני</h2>
        <ul className="players-list">
          {game.players.map((p, i) => (
            <li key={p.id} className={i === game.currentPlayerIdx ? 'active' : ''}>
              <span className="player-name">{p.name}</span>
              <span className="player-score">{p.score}</span>
              <span className="score-buttons">
                <button className="btn btn-mini" onClick={() => dispatch({ type: 'MANUAL_ADJUST', playerId: p.id, delta: 1 })}>+1</button>
                <button className="btn btn-mini" onClick={() => dispatch({ type: 'MANUAL_ADJUST', playerId: p.id, delta: -1 })}>−1</button>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <footer className="admin-footer">
        חלון תצוגה: פתח את <a href="/display" target="_blank" rel="noreferrer">/display</a> בחלון נפרד וגרור למסך השני
      </footer>
    </div>
  );
}
