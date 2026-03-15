import { useRef, useEffect, useCallback } from 'react';

export function useGameSounds() {
  const combineRef = useRef(null);
  const failRef = useRef(null);
  const grabRef = useRef(null);
  const beforeCombineRef = useRef(null);

  useEffect(() => {
    const combine = new Audio('/sounds/success.mp3');
    combine.volume = 0.6;
    combine.preload = 'auto';

    const fail = new Audio('/sounds/fail.mp3');
    fail.volume = 0.4;
    fail.preload = 'auto';

    const grab = new Audio('/sounds/pressBubble.mp3');
    grab.volume = 0.5;
    grab.preload = 'auto';

    const beforeCombine = new Audio('/sounds/soundBeforeCombining.mp3');
    beforeCombine.volume = 0.4;
    beforeCombine.preload = 'auto';

    combineRef.current = combine;
    failRef.current = fail;
    grabRef.current = grab;
    beforeCombineRef.current = beforeCombine;
  }, []);

  const play = (ref) => {
    const a = ref.current;
    if (!a) return;
    a.currentTime = 0;
    a.play().catch(() => {});
  };

  const playGrab = useCallback(() => play(grabRef), []);
  const playBeforeCombine = useCallback(() => play(beforeCombineRef), []);
  const playCombineSuccess = useCallback(() => play(combineRef), []);
  const playCombineFail = useCallback(() => play(failRef), []);

  return { playGrab, playBeforeCombine, playCombineSuccess, playCombineFail };
}