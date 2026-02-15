// games/ColorTrap.js
import React, { useState, useMemo } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';

import GameContainer from '../GameContainer';
import GameTimer from '../GameTimer';
import useGameTimer from '../useGameTimer';
import useAntiForceClose from '../useAntiForceClose';
import { GAME_CONFIG } from '../gameConfig';

import { triggerFail, triggerSuccess } from '../BrainGameController';
import {completeAlarm} from '../alarmCompletion'


const GAME_TYPE = 'COLOR_TRAP';
const COLORS = ['RED', 'GREEN', 'BLUE', 'YELLOW'];

export default function ColorTrap({ route }) {
  useAntiForceClose();

  const alarmId = route?.params?.alarmId;
  if (!alarmId) return null;

  const config = GAME_CONFIG[GAME_TYPE];
  const [tries, setTries] = useState(0);

  const puzzle = useMemo(() => {
    const target = COLORS[Math.floor(Math.random() * COLORS.length)];
    const misleading =
      COLORS.filter(c => c !== target)[
        Math.floor(Math.random() * 3)
      ];
    return { target, misleading };
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

      <Text
        style={[
          styles.instruction,
          { color: puzzle.misleading.toLowerCase() },
        ]}
      >
        TAP {puzzle.target}
      </Text>

      {COLORS.map(c => (
        <TouchableOpacity
          key={`color-${c}`}
          style={styles.option}
          onPress={() => (c === puzzle.target ? onSuccess() : onFail())}
        >
          <Text style={styles.optionText}>{c}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.tries}>
        Tries left: {config.maxTries - tries}
      </Text>
    </GameContainer>
  );
}

const styles = StyleSheet.create({
  instruction: {
    fontSize: 40,
    fontWeight: '900',
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
