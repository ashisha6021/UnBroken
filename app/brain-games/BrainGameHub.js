// BrainGameHub.js

import { useEffect, useRef } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getRealm } from '../../storage/database';
import { pickGame } from './gamePicker';
import {
  setBrainGameCallbacks,
  resetBrainGameController,
} from './BrainGameController';
import { exitAppSafely } from './exitAppSafely';
import { completeAlarm } from './alarmCompletion';

export default function BrainGameHub() {
  const navigation = useNavigation();
  const route = useRoute();
  const realm = getRealm();

  const { taskId, alarmId } = route.params;

  const playedRef = useRef([]);

  function launchNextGame() {
    const game = pickGame(realm, taskId, playedRef.current);
    playedRef.current.push(game);

    navigation.replace(game, { alarmId });
  }

  async function handleSuccess() {
     console.log('✅ [BrainGameHub] Alarm completed');
    await completeAlarm({ alarmId });
    exitAppSafely(0);
  }

  function handleFail() {
    launchNextGame();
  }

  useEffect(() => {
    resetBrainGameController();

    setBrainGameCallbacks({
      onFail: handleFail,
      onSuccess: handleSuccess,
    });

    launchNextGame();
  }, []);

  return null;
}
