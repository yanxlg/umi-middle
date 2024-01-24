import { useEffect, useRef, DependencyList, EffectCallback } from 'react';

function createUpdateEffect(hook: (effect: EffectCallback, deps?: DependencyList) => void) {
  return function (effect: EffectCallback, deps: DependencyList) {
    const isMounted = useRef(false);
    // for react-refresh
    hook(function () {
      return function () {
        isMounted.current = false;
      };
    }, []);
    hook(function () {
      if (!isMounted.current) {
        isMounted.current = true;
      } else {
        return effect();
      }
    }, deps);
  };
};

export default createUpdateEffect(useEffect);
