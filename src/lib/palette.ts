import type { Theme } from '../hooks/useTheme';

/** 3D сахналардын жана фондун (аврора, чекит-торчо) түстөрү — ар бир тема үчүн өзүнчө.
 *  bg мааниси global.css'теги --bg менен бирдей болушу керек. */
export const SCENE_COLORS: Record<Theme, { bg: string; a: string; b: string; c: string; particles: string; wire: string }> = {
  dark: { bg: '#07070d', a: '#22d3ee', b: '#8b5cf6', c: '#f472b6', particles: '#7dd3fc', wire: '#a78bfa' },
  light: { bg: '#f5f6fb', a: '#0891b2', b: '#6d28d9', c: '#db2777', particles: '#4f46e5', wire: '#6d28d9' },
};
