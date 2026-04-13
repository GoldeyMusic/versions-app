import T from "../constants/theme";

/* ── VERSIONS LOGO ──────────────────────────────────────── */
export const VersionsLogo = ({ sz = 1 }) => (
  <svg width={28 * sz} height={28 * sz} viewBox="0 0 1024 1024">
    <path
      fill={T.amber}
      d="M734.22,536.73l167.31-291.84c.6-1.05.96-2.58.98-3.29.03-.88-2.38-1.87-3.69-1.87h-202.02c-1.87,0-2.79-4.23-1.95-5.46l14.53-21.19c12.76-14.42,31.1-27.23,51.67-27.26l220.82-.34c4.26,0,7.79,3.86,9.04,6.39,1.89,3.82,1.8,8.48-.55,12.66l-124.4,220.48-239.06,419.6c-11.98,21.03-27.58,38.95-49.19,50.16-13,6.74-26.8,11.29-41.72,11.24l-45.01-.15c-34.85-2.84-64.76-23.99-82.3-53.61l-53.22-89.89-111.87-191.94-69.62-120.4-70.31-122.81-70.46-123.35c-2.41-4.21-1.93-8.84.24-12.67,1.86-3.26,5.73-5.8,10.67-5.79l202.93.58c24.99.07,49.01,16.32,62.11,36.46,8.07,12.41,13.85,23.97,20.85,36.72l72.9,132.78,14.4,25.93c2.27,4.09,3.75,8.22,1.79,12.44s-5.98,6.59-11.12,6.65l-32.82.41c-7.14.09-10.6-3.6-13.65-8.99l-36.49-64.58-58.31-102.54c-7.48-13.16-22.66-19.43-36.93-21.59l-104.71.11-3.19.6c-.79.15-.8,2.54-.38,3.34l7.98,15.15c102.09,179.25,205.77,356.88,310.92,534.52,12.1,20.44,31.21,36.79,55.72,38.96,12.51,1.1,25.15,1.39,38.01-.1,18.16-2.11,36.21-13.29,46.41-28.37l24.73-41.82,128.96-225.3Z"
    />
    <path
      fill={T.amber}
      d="M564.03,768.68c-10.56,8.9-20.41,14.2-34.02,16.49l-28.87.36c-1.45.02-5.04-1.62-5.04-2.89l.05-354.09c0-6.54,6.17-11.59,11.84-11.59l62.06-.04c7.05,0,13.83,4.32,13.83,12.31l.04,306.13-19.89,33.31Z"
    />
    <path
      fill={T.amber}
      d="M704.62,530.59l-23.4,40.72-63.05,106.97-.23-374.82c.32-7.36,4.81-13.05,12.07-13.06l61.09-.12c5.25,0,13.45,2.73,13.46,9.86l.07,230.45Z"
    />
    <path
      fill={T.amber}
      d="M462.52,766.66c-8.4-9.04-13.55-19.83-20.14-30.3l-66.57-112.35.09-92.9c0-6.59,6.48-10.87,12.23-11h62.81c6.33.01,10.87,4.49,11.69,11.08l-.11,235.46Z"
    />
  </svg>
);

/* ── CATEGORY ICONS ─────────────────────────────────────── */
export const IconBass = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M2 14 Q2 4 9 4 Q16 4 16 9 Q16 14 9 14"
      stroke={T.amber}
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
    <circle cx="5" cy="14" r="1.5" fill={T.amber} />
    <line x1="2" y1="14" x2="2" y2="16" stroke={T.amber} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconDrums = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <ellipse cx="9" cy="7" rx="6" ry="2.5" stroke={T.amber} strokeWidth="1.4" fill="none" />
    <line x1="3" y1="7" x2="3" y2="13" stroke={T.amber} strokeWidth="1.4" />
    <line x1="15" y1="7" x2="15" y2="13" stroke={T.amber} strokeWidth="1.4" />
    <ellipse cx="9" cy="13" rx="6" ry="2.5" stroke={T.amber} strokeWidth="1.4" fill="none" />
    <line
      x1="6"
      y1="3"
      x2="8"
      y2="7"
      stroke={T.amber}
      strokeWidth="1.3"
      strokeLinecap="round"
      opacity="0.6"
    />
    <line
      x1="12"
      y1="3"
      x2="10"
      y2="7"
      stroke={T.amber}
      strokeWidth="1.3"
      strokeLinecap="round"
      opacity="0.6"
    />
  </svg>
);

export const IconSynth = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="2" y="6" width="14" height="8" rx="1.5" stroke={T.amber} strokeWidth="1.4" fill="none" />
    {[4, 6, 8, 10, 12, 14].map((x, i) => (
      <line key={i} x1={x} y1="6" x2={x} y2="14" stroke={T.amber} strokeWidth="0.8" opacity="0.35" />
    ))}
    {[5, 8, 11].map((x, i) => (
      <rect key={i} x={x} y="6" width="1.8" height="5" rx="0.5" fill={T.amber} opacity="0.7" />
    ))}
  </svg>
);

export const IconFX = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M2 11 Q5 4 9 9 Q13 14 16 7" stroke={T.amber} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <circle cx="9" cy="9" r="1.2" fill={T.amber} />
    <path
      d="M2 14 Q5 11 9 13 Q13 15 16 12"
      stroke={T.amber}
      strokeWidth="1"
      strokeLinecap="round"
      fill="none"
      opacity="0.35"
    />
  </svg>
);

export const IconLevel = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    {[2, 5, 8, 11, 14].map((x, i) => {
      const h = [6, 10, 14, 8, 4][i];
      return (
        <rect
          key={i}
          x={x}
          y={16 - h}
          width="2.5"
          height={h}
          rx="1"
          fill={T.amber}
          opacity={0.3 + i * 0.15}
        />
      );
    })}
    <line x1="2" y1="7" x2="16" y2="7" stroke={T.red} strokeWidth="1" strokeDasharray="2 2" opacity="0.7" />
  </svg>
);

export const IconMids = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M2 9 Q5 9 6 5 Q7 1 9 9 Q11 17 12 13 Q13 9 16 9" stroke={T.amber} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <circle cx="9" cy="9" r="1.5" fill={T.amber} opacity="0.4" />
  </svg>
);

export const IconStereo = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <line x1="9" y1="2" x2="9" y2="16" stroke={T.amber} strokeWidth="1" opacity="0.3" strokeDasharray="2 2" />
    <path d="M2 9 Q5 5 9 9" stroke={T.amber} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <path d="M16 9 Q13 5 9 9" stroke={T.amber} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <path
      d="M2 9 Q5 13 9 9"
      stroke={T.amber}
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
      opacity="0.4"
    />
    <path
      d="M16 9 Q13 13 9 9"
      stroke={T.amber}
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
      opacity="0.4"
    />
  </svg>
);

/* ── INPUT ICONS ────────────────────────────────────────── */
export const IconLink = ({ c = T.muted, sz = 14 }) => (
  <svg width={sz} height={sz} viewBox="0 0 14 14" fill="none">
    <path d="M5.5 8.5 Q3 8.5 3 6 Q3 3.5 5.5 3.5 L7 3.5" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
    <path d="M8.5 5.5 Q11 5.5 11 8 Q11 10.5 8.5 10.5 L7 10.5" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
    <line x1="5" y1="7" x2="9" y2="7" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const IconUpload = ({ c = T.muted, sz = 14 }) => (
  <svg width={sz} height={sz} viewBox="0 0 14 14" fill="none">
    <path d="M7 9 L7 2 M4.5 4.5 L7 2 L9.5 4.5" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 10 L2 12 L12 12 L12 10" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── UI ICONS ───────────────────────────────────────────── */
export const IconTarget = ({ c = T.cyan, sz = 20 }) => (
  <svg width={sz} height={sz} viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="8" stroke={c} strokeWidth="1.4" />
    <circle cx="10" cy="10" r="4.5" stroke={c} strokeWidth="1.4" />
    <circle cx="10" cy="10" r="1.5" fill={c} />
    <line x1="10" y1="1" x2="10" y2="4" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
    <line x1="10" y1="16" x2="10" y2="19" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
    <line x1="1" y1="10" x2="4" y2="10" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
    <line x1="16" y1="10" x2="19" y2="10" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const IconScope = ({ c = T.green, sz = 20 }) => (
  <svg width={sz} height={sz} viewBox="0 0 20 20" fill="none">
    <circle cx="8.5" cy="8.5" r="5.5" stroke={c} strokeWidth="1.4" />
    <line x1="12.5" y1="12.5" x2="18" y2="18" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
    <line x1="6" y1="8.5" x2="11" y2="8.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
    <line x1="8.5" y1="6" x2="8.5" y2="11" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
  </svg>
);

export const IconCheckCircle = ({ c = T.green, sz = 24 }) => (
  <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={c} strokeWidth="1.5" />
    <polyline
      points="7,12 10.5,15.5 17,9"
      stroke={c}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconWaveUpload = ({ c = T.muted, sz = 28 }) => (
  <svg width={sz} height={sz} viewBox="0 0 28 28" fill="none">
    <path d="M14 20 L14 10 M10 14 L14 10 L18 14" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path
      d="M4 18 Q6 12 8 16 Q10 20 12 14 Q14 8 16 14 Q18 20 20 16 Q22 12 24 18"
      stroke={c}
      strokeWidth="1.3"
      strokeLinecap="round"
      fill="none"
      opacity="0.5"
    />
  </svg>
);

export const IconPlug = ({ c = T.amber, sz = 16 }) => (
  <svg width={sz} height={sz} viewBox="0 0 16 16" fill="none">
    <rect x="5" y="8" width="6" height="5" rx="1.5" stroke={c} strokeWidth="1.3" />
    <line x1="7" y1="3" x2="7" y2="8" stroke={c} strokeWidth="1.3" strokeLinecap="round" />
    <line x1="9" y1="3" x2="9" y2="8" stroke={c} strokeWidth="1.3" strokeLinecap="round" />
    <line x1="8" y1="13" x2="8" y2="15" stroke={c} strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

export const IconBulb = ({ c = T.amber, sz = 14 }) => (
  <svg width={sz} height={sz} viewBox="0 0 14 14" fill="none">
    <path
      d="M7 2 Q10.5 2 10.5 6 Q10.5 8.5 8.5 9.5 L8.5 11 L5.5 11 L5.5 9.5 Q3.5 8.5 3.5 6 Q3.5 2 7 2 Z"
      stroke={c}
      strokeWidth="1.2"
      fill="none"
    />
    <line x1="5.5" y1="11" x2="8.5" y2="11" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
    <line x1="6" y1="12.5" x2="8" y2="12.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

export const IconPin = ({ c = T.amber, sz = 13 }) => (
  <svg width={sz} height={sz} viewBox="0 0 13 13" fill="none">
    <path
      d="M6.5 1 Q9.5 1 9.5 4.5 Q9.5 7 6.5 12 Q3.5 7 3.5 4.5 Q3.5 1 6.5 1 Z"
      stroke={c}
      strokeWidth="1.3"
      fill={`${c}22`}
    />
    <circle cx="6.5" cy="4.5" r="1.5" fill={c} />
  </svg>
);

export const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <line x1="1" y1="1" x2="13" y2="13" stroke={T.muted} strokeWidth="1.6" strokeLinecap="round" />
    <line x1="13" y1="1" x2="1" y2="13" stroke={T.muted} strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

/* ── ADDITIONAL ICONS (from maquette) ─────────────────────── */
export const IconStar = ({ filled = false, c = T.amber, sz = 16 }) => (
  <svg width={sz} height={sz} viewBox="0 0 16 16" fill="none">
    <path
      d="M8 1.5L10.5 6.5L16 7.5L12 11.5L13 17L8 14L3 17L4 11.5L0 7.5L5.5 6.5Z"
      fill={filled ? c : "none"}
      stroke={c}
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconDrag = ({ c = T.muted, sz = 16 }) => (
  <svg width={sz} height={sz} viewBox="0 0 16 16" fill="none">
    <circle cx="4" cy="4" r="1.2" fill={c} />
    <circle cx="4" cy="8" r="1.2" fill={c} />
    <circle cx="4" cy="12" r="1.2" fill={c} />
    <circle cx="12" cy="4" r="1.2" fill={c} />
    <circle cx="12" cy="8" r="1.2" fill={c} />
    <circle cx="12" cy="12" r="1.2" fill={c} />
  </svg>
);

export const IconTrash = ({ c = T.muted, sz = 16 }) => (
  <svg width={sz} height={sz} viewBox="0 0 16 16" fill="none">
    <path d="M2 4h12M6.5 2H9.5M3.5 4v10c0 .5.5 1 1 1h7c.5 0 1-.5 1-1V4" stroke={c} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="6.5" y1="6.5" x2="6.5" y2="11.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
    <line x1="9.5" y1="6.5" x2="9.5" y2="11.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

export const IconEdit = ({ c = T.muted, sz = 16 }) => (
  <svg width={sz} height={sz} viewBox="0 0 16 16" fill="none">
    <path
      d="M11 2.5L13.5 5M2.5 13.5L5 11L13 3l2.5 2.5L7.5 13.5H2.5V9z"
      stroke={c}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconEye = ({ c = T.muted, sz = 16 }) => (
  <svg width={sz} height={sz} viewBox="0 0 16 16" fill="none">
    <path d="M1 8s2-4 7-4 7 4 7 4-2 4-7 4-7-4-7-4z" stroke={c} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="8" cy="8" r="2" stroke={c} strokeWidth="1.2" />
  </svg>
);

export const IconPlay = ({ c = T.black, sz = 16 }) => (
  <svg width={sz} height={sz} viewBox="0 0 16 16" fill={c}>
    <polygon points="3,1 15,8 3,15" />
  </svg>
);

export const IconPause = ({ c = T.black, sz = 16 }) => (
  <svg width={sz} height={sz} viewBox="0 0 16 16" fill={c}>
    <rect x="2" y="1" width="4" height="14" rx="1" />
    <rect x="10" y="1" width="4" height="14" rx="1" />
  </svg>
);

export const IconSkipNext = ({ c = T.muted, sz = 14 }) => (
  <svg width={sz} height={sz} viewBox="0 0 14 14" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round">
    <polyline points="5,2 11,7 5,12" />
    <polyline points="1,2 7,7 1,12" />
  </svg>
);

export const IconSkipPrev = ({ c = T.muted, sz = 14 }) => (
  <svg width={sz} height={sz} viewBox="0 0 14 14" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round">
    <polyline points="9,2 3,7 9,12" />
    <polyline points="13,2 7,7 13,12" />
  </svg>
);

/* ── NAVIGATION & UTILITY ICONS ────────────────────────── */
export const IconWave = ({ c = T.amber, s = 18 }) => (
  <svg width={s} height={s} viewBox="0 0 18 18" fill="none">
    <path d="M2 9h2l1.5-4 2 8 2-6 1.5 4H14" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconCheck = ({ c = T.green }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7" stroke={c} strokeWidth="1.4" />
    <path d="M5 8l2 2 4-4" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconPlus = ({ c = T.muted }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <line x1="7" y1="3" x2="7" y2="11" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
    <line x1="3" y1="7" x2="11" y2="7" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const IconX = ({ c = T.muted }) => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M3 3l6 6M9 3l-6 6" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const IconSend = ({ c = T.black }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M14 2L7 9M14 2L10 14L7 9M14 2L2 6L7 9" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconArrowR = ({ c = T.muted2 }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 4l4 4-4 4" stroke={c} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconHome = ({ c = T.text, s = 20 }) => (
  <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
    <path d="M3 8.5L10 3l7 5.5V16a1 1 0 01-1 1H4a1 1 0 01-1-1V8.5z" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 17v-5h4v5" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconHistory = ({ c = T.text, s = 20 }) => (
  <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="7.5" stroke={c} strokeWidth="1.4" />
    <path d="M10 6v4l2.5 2" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconQuestion = ({ c = T.text, s = 20 }) => (
  <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
    <path d="M3 15l2-2H16a1 1 0 001-1V4a1 1 0 00-1-1H4a1 1 0 00-1 1v11z" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconSettings = ({ c = T.text, s = 20 }) => (
  <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
    <path d="M8.5 2h3l.4 2.1a5.5 5.5 0 011.5.9l2-.8 1.5 2.6-1.6 1.4a5.5 5.5 0 010 1.7l1.6 1.4-1.5 2.6-2-.8a5.5 5.5 0 01-1.5.9L11.5 18h-3l-.4-2.1a5.5 5.5 0 01-1.5-.9l-2 .8-1.5-2.6 1.6-1.4a5.5 5.5 0 010-1.7L3.1 8.8l1.5-2.6 2 .8a5.5 5.5 0 011.5-.9L8.5 2z" stroke={c} strokeWidth="1.3" strokeLinejoin="round" />
    <circle cx="10" cy="10" r="2.5" stroke={c} strokeWidth="1.4" />
  </svg>
);
