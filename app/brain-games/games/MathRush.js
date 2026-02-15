// games/MathRush.js
import React, { useState, useMemo } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';

import GameContainer from '../GameContainer';
import GameTimer from '../GameTimer';
import useGameTimer from '../useGameTimer';
import useAntiForceClose from '../useAntiForceClose';
import { GAME_CONFIG } from '../gameConfig';
import { rand, shuffle } from './helpers';

import { triggerFail, triggerSuccess } from '../BrainGameController';
import {completeAlarm} from '../alarmCompletion'

const GAME_TYPE = 'MATH_RUSH';

export default function MathRush({ route }) {
  useAntiForceClose();

  const alarmId = route?.params?.alarmId;
  if (!alarmId) return null;

  const config = GAME_CONFIG[GAME_TYPE];
  const [tries, setTries] = useState(0);

  const puzzle = useMemo(() => {
    const a = rand(3, 9);
    const b = rand(2, 9);
    const c = rand(1, 5);
    const answer = a * b + c;
    return {
      text: `${a} × ${b} + ${c}`,
      answer,
      options: shuffle([
        answer,
        answer + rand(1, 5),
        answer - rand(1, 4),
      ]),
    };
  }, [tries]);

  const timeLeft = useGameTimer(config.timeLimit, onFail);

 function onSuccess() {
  triggerSuccess(); // DO NOT navigate
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


  return (
    <GameContainer>
      <GameTimer timeLeft={timeLeft} />

      <Text style={styles.question}>{puzzle.text}</Text>

      {puzzle.options.map(v => (
        <TouchableOpacity
          key={`math-${v}`}
          style={styles.option}
          onPress={() => (v === puzzle.answer ? onSuccess() : onFail())}
        >
          <Text style={styles.optionText}>{v}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.tries}>
        Tries left: {config.maxTries - tries}
      </Text>
    </GameContainer>
  );
}

const styles = StyleSheet.create({
  question: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginVertical: 24,
  },
  option: {
    backgroundColor: '#ffd60a',
    paddingVertical: 18,
    borderRadius: 14,
    marginVertical: 8,
  },
  optionText: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    color: '#000',
  },
  tries: {
    textAlign: 'center',
    color: '#aaa',
    marginTop: 12,
  },
});
