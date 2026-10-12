import type * as THREETypes from 'three';

/**
 * Three.js npm аркылуу эмес, CDN'ден динамикалык түрдө жүктөлөт.
 * Типтер @types/three пакетинен гана алынат (код бандлга кирбейт).
 */
export type Three = typeof THREETypes;

const THREE_CDN_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let threePromise: Promise<Three> | null = null;

/** Three.js'ти бир гана жолу жүктөйт, кийинки чакырууларда ошол эле Promise кайтат. */
export function loadThree(): Promise<Three> {
  if (!threePromise) {
    threePromise = import(/* @vite-ignore */ THREE_CDN_URL) as Promise<Three>;
  }
  return threePromise;
}
