// games/MemoryFlash.js
import React, { useState, useEffect, useMemo } from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';

import GameContainer from '../GameContainer';
import GameTimer from '../GameTimer';
import useGameTimer from '../useGameTimer';
import useAntiForceClose from '../useAntiForceClose';
import { GAME_CONFIG } from '../gameConfig';
import { shuffle } from './helpers';
import { triggerFail, triggerSuccess } from '../BrainGameController';

const GAME_TYPE = 'MEMORY_FLASH';

const EMOJIS = ['🍎', '🚗', '🐶', '🎧', '⚽', '🍕'];

export default function MemoryFlash({ route }) {
  useAntiForceClose();

  const alarmId = route?.params?.alarmId;
  if (!alarmId) return null;

  const config = GAME_CONFIG[GAME_TYPE];

  const [tries, setTries] = useState(0);
  const [phase, setPhase] = useState('FLASH'); // FLASH | QUESTION

  /* --------------------------------------------------
     🧠 PUZZLE (ONE EMOJI ONLY)
  -------------------------------------------------- */
  const puzzle = useMemo(() => {
    const shuffled = shuffle(EMOJIS);
    const answer = shuffled[0];               // 👀 ONLY THIS IS SHOWN
    const options = shuffle(shuffled.slice(0, 4));

    return { answer, options };
  }, []);

  /* --------------------------------------------------
     ⏱️ GAME TIMER
  -------------------------------------------------- */
  const timeLeft = useGameTimer(config.timeLimit, onFail);

  /* --------------------------------------------------
     ⏳ FLASH → QUESTION
  -------------------------------------------------- */
  useEffect(() => {
    const t = setTimeout(() => {
      setPhase('QUESTION');
    }, 2000); // 2 seconds pressure

    return () => clearTimeout(t);
  }, []);

  /* --------------------------------------------------
     ✅ SUCCESS / ❌ FAIL
  -------------------------------------------------- */
  function onSuccess() {
    triggerSuccess(); // BrainGameHub handles alarm completion
  }

  function onFail() {
    setTries(prev => {
      const next = prev + 1;

      if (next >= config.maxTries) {
        triggerFail(GAME_TYPE);
      }

      return next;
    });
  }

  /* --------------------------------------------------
     🎮 UI
  -------------------------------------------------- */
  return (
    <GameContainer>
      <GameTimer timeLeft={timeLeft} />

      {/* ---------- FLASH ---------- */}
      {phase === 'FLASH' && (
        <View style={styles.flashBox}>
          <Text style={styles.flashEmoji}>
            {puzzle.answer}
          </Text>
          <Text style={styles.flashHint}>
            Memorize!
          </Text>
        </View>
      )}

      {/* ---------- QUESTION ---------- */}
      {phase === 'QUESTION' && (
        <>
          <Text style={styles.question}>
            Which emoji was shown?
          </Text>

          {puzzle.options.map(e => (
            <TouchableOpacity
              key={`emoji-${e}`}
              style={styles.option}
              onPress={() => (e === puzzle.answer ? onSuccess() : onFail())}
              activeOpacity={0.85}
            >
              <Text style={styles.optionText}>{e}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* ---------- TRIES ---------- */}
      <Text style={styles.tries}>
        Tries left: {config.maxTries - tries}
      </Text>
    </GameContainer>
  );
}

/* ==================================================
   🎨 STYLES
================================================== */
const styles = StyleSheet.create({
  flashBox: {
    marginTop: 80,
    alignItems: 'center',
  },

  flashEmoji: {
    fontSize: 88,
    fontWeight: '900',
    textAlign: 'center',
  },

  flashHint: {
    marginTop: 12,
    fontSize: 16,
    color: '#aaa',
    letterSpacing: 1,
  },

  question: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginVertical: 24,
  },

  option: {
    backgroundColor: '#ffd60a',
    paddingVertical: 18,
    borderRadius: 14,
    marginVertical: 8,
    elevation: 3,
  },

  optionText: {
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    color: '#000',
  },

  tries: {
    textAlign: 'center',
    color: '#aaa',
    marginTop: 18,
    fontSize: 14,
  },
});
