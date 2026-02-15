// games/PatternBeast.js
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



const GAME_TYPE = 'PATTERN_BEAST';

export default function PatternBeast({ route }) {
  useAntiForceClose();

  const alarmId = route?.params?.alarmId;
  if (!alarmId) return null;




  const config = GAME_CONFIG[GAME_TYPE];
  const [tries, setTries] = useState(0);

  const puzzle = useMemo(() => {
    const start = rand(2, 5);
    const mul = rand(2, 4);
    const a = start;
    const b = a * mul;
    const c = b * mul;
    const answer = c * mul;

    return {
      text: `${a} → ${b} → ${c} → ?`,
      answer,
      options: shuffle([
        answer,
        answer + mul,
        answer - mul,
      ]),
    };
  }, []);

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

      <Text style={styles.pattern}>{puzzle.text}</Text>

      {puzzle.options.map(o => (
        <TouchableOpacity
          key={`pat-${o}`}
          style={styles.option}
          onPress={() => (o === puzzle.answer ? onSuccess() : onFail())}
        >
          <Text style={styles.optionText}>{o}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.tries}>
        Tries left: {config.maxTries - tries}
      </Text>
    </GameContainer>
  );
}

const styles = StyleSheet.create({
  pattern: {
    fontSize: 36,
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
    fontSize: 24,
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
