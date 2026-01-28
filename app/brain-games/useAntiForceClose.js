// useAntiForceClose.js (FIXED)
import { useEffect } from 'react';
import { BackHandler } from 'react-native';

export default function useAntiForceClose() {
  useEffect(() => {
    const back = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true // block back only
    );

    return () => back.remove();
  }, []);
}
