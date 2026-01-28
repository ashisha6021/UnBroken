// gamePicker.js
import { GAME_CONFIG } from './gameConfig';

const ALL_GAMES = Object.keys(GAME_CONFIG);

export function pickGame(realm, taskId, played = []) {
  // last 2 played games from previous alarms
  const recent = realm
    .objects('brain_game_logs')
    .filtered('taskId == $0 SORT(createdAt DESC)', taskId)
    .slice(0, 2)
    .map(g => g.gameType);

  const candidates = ALL_GAMES.filter(
    g => !recent.includes(g) && !played.includes(g)
  );

  const pool = candidates.length ? candidates : ALL_GAMES;
  return pool[Math.floor(Math.random() * pool.length)];
}
