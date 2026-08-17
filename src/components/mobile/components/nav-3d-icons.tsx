'use client';

import { motion } from 'framer-motion';

interface Nav3DIconProps {
  active: boolean;
  darkMode?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════
// 3D HOME ICON
// ═══════════════════════════════════════════════════════════════════════
export function Nav3DHomeIcon({ active, darkMode }: Nav3DIconProps) {
  const color = active ? (darkMode ? '#00C4E8' : '#004B63') : (darkMode ? '#6B7280' : '#9CA3AF');
  const colorLight = active ? (darkMode ? '#33D4F0' : '#007B8A') : (darkMode ? '#4B5563' : '#B0B8C4');
  const colorDark = active ? (darkMode ? '#0098B8' : '#003547') : (darkMode ? '#374151' : '#7A8494');
  const shadowColor = active ? (darkMode ? 'rgba(0,196,232,0.35)' : 'rgba(0,75,99,0.35)') : 'transparent';
  const id = active ? 'ha' : 'hi';

  return (
    <motion.svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{ scale: active ? 1.08 : 0.88 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
      style={{ filter: active ? `drop-shadow(0px 2px 4px ${shadowColor})` : 'none' }}
    >
      <defs>
        <linearGradient id={`hr-${id}`} x1="4" y1="4" x2="24" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={colorLight} />
          <stop offset="100%" stopColor={colorDark} />
        </linearGradient>
        <linearGradient id={`hb-${id}`} x1="8" y1="14" x2="20" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={colorLight} />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
        <linearGradient id={`hd-${id}`} x1="12" y1="18" x2="16" y2="25" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={colorDark} />
        </linearGradient>
      </defs>
      {/* Roof */}
      <path d="M14 4L3 14H6V23H11V18H17V23H22V14H25L14 4Z" fill={`url(#hr-${id})`} />
      {/* Body highlight */}
      <path d="M14 4L3 14H6V23H11V18H17V23H22V14H25L14 4Z" fill={`url(#hb-${id})`} opacity="0.7" />
      {/* Left roof face (3D) */}
      <path d="M14 4L3 14H14V4Z" fill={colorLight} opacity="0.4" />
      {/* Right roof face (3D) */}
      <path d="M14 4L25 14H14V4Z" fill={colorDark} opacity="0.3" />
      {/* Door */}
      <path d="M12 18V24H16V18H12Z" fill={`url(#hd-${id})`} />
      {/* Door highlight */}
      <path d="M12 18V24H13.5V18H12Z" fill={colorLight} opacity="0.3" />
      {/* Chimney */}
      <rect x="18" y="6" width="2.5" height="5" rx="0.5" fill={colorDark} opacity="0.6" />
      {/* Window left */}
      <rect x="8" y="15" width="2.5" height="2.5" rx="0.5" fill={active ? (darkMode ? '#0B1120' : 'white') : (darkMode ? '#1F2937' : '#E5E7EB')} opacity="0.7" />
      {/* Window right */}
      <rect x="17.5" y="15" width="2.5" height="2.5" rx="0.5" fill={active ? (darkMode ? '#0B1120' : 'white') : (darkMode ? '#1F2937' : '#E5E7EB')} opacity="0.7" />
      {/* Active glow overlay */}
      {active && (
        <path d="M14 4L3 14H6V23H11V18H17V23H22V14H25L14 4Z" fill="white" opacity="0.12" />
      )}
    </motion.svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 3D CATEGORIES / GRID ICON
// ═══════════════════════════════════════════════════════════════════════
export function Nav3DCategoriesIcon({ active, darkMode }: Nav3DIconProps) {
  const color = active ? (darkMode ? '#00C4E8' : '#004B63') : (darkMode ? '#6B7280' : '#9CA3AF');
  const colorLight = active ? (darkMode ? '#33D4F0' : '#007B8A') : (darkMode ? '#4B5563' : '#B0B8C4');
  const colorDark = active ? (darkMode ? '#0098B8' : '#003547') : (darkMode ? '#374151' : '#7A8494');
  const shadowColor = active ? (darkMode ? 'rgba(0,196,232,0.35)' : 'rgba(0,75,99,0.35)') : 'transparent';
  const id = active ? 'ca' : 'ci';

  return (
    <motion.svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{ scale: active ? 1.08 : 0.88 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
      style={{ filter: active ? `drop-shadow(0px 2px 4px ${shadowColor})` : 'none' }}
    >
      <defs>
        <linearGradient id={`ctl-${id}`} x1="3" y1="3" x2="12" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={colorLight} />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
        <linearGradient id={`ctr-${id}`} x1="16" y1="3" x2="25" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={colorDark} />
        </linearGradient>
        <linearGradient id={`cbl-${id}`} x1="3" y1="16" x2="12" y2="25" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={colorDark} />
        </linearGradient>
        <linearGradient id={`cbr-${id}`} x1="16" y1="16" x2="25" y2="25" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={colorDark} />
          <stop offset="100%" stopColor={colorLight} />
        </linearGradient>
      </defs>
      {/* Top-left tile */}
      <rect x="3" y="3" width="9.5" height="9.5" rx="2.5" fill={`url(#ctl-${id})`} />
      <rect x="4" y="4" width="7.5" height="4" rx="1.5" fill="white" opacity="0.15" />
      {/* Top-right tile (elevated 3D) */}
      <rect x="16.5" y="4" width="9.5" height="9.5" rx="2.5" fill="black" opacity="0.08" />
      <rect x="15.5" y="3" width="9.5" height="9.5" rx="2.5" fill={`url(#ctr-${id})`} />
      <path d="M15.5 5.5C15.5 4.67 16.17 4 17 4H23C23.83 4 24.5 4.67 24.5 5.5V6.5H15.5V5.5Z" fill="white" opacity="0.12" />
      {/* Bottom-left tile (elevated 3D) */}
      <rect x="4" y="16" width="9.5" height="9.5" rx="2.5" fill="black" opacity="0.08" />
      <rect x="3" y="15" width="9.5" height="9.5" rx="2.5" fill={`url(#cbl-${id})`} />
      <path d="M3 17.5C3 16.67 3.67 16 4.5 16H10.5C11.33 16 12 16.67 12 17.5V18.5H3V17.5Z" fill="white" opacity="0.12" />
      {/* Bottom-right tile */}
      <rect x="16.5" y="16" width="9.5" height="9.5" rx="2.5" fill="black" opacity="0.08" />
      <rect x="15.5" y="15" width="9.5" height="9.5" rx="2.5" fill={`url(#cbr-${id})`} />
      <rect x="16.5" y="16" width="7.5" height="4" rx="1.5" fill="white" opacity="0.1" />
      {/* Active glow */}
      {active && (
        <>
          <rect x="3" y="3" width="9.5" height="9.5" rx="2.5" fill="white" opacity="0.1" />
          <rect x="15.5" y="3" width="9.5" height="9.5" rx="2.5" fill="white" opacity="0.1" />
          <rect x="3" y="15" width="9.5" height="9.5" rx="2.5" fill="white" opacity="0.1" />
          <rect x="15.5" y="15" width="9.5" height="9.5" rx="2.5" fill="white" opacity="0.1" />
        </>
      )}
    </motion.svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 3D CART ICON (with badge support)
// ═══════════════════════════════════════════════════════════════════════
export function Nav3DCartIcon({ active, darkMode, itemCount }: Nav3DIconProps & { itemCount?: number }) {
  const color = active ? (darkMode ? '#00C4E8' : '#004B63') : (darkMode ? '#6B7280' : '#9CA3AF');
  const colorLight = active ? (darkMode ? '#33D4F0' : '#007B8A') : (darkMode ? '#4B5563' : '#B0B8C4');
  const colorDark = active ? (darkMode ? '#0098B8' : '#003547') : (darkMode ? '#374151' : '#7A8494');
  const shadowColor = active ? (darkMode ? 'rgba(0,196,232,0.35)' : 'rgba(0,75,99,0.35)') : 'transparent';
  const id = active ? 'rta' : 'rti';

  return (
    <motion.svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{ scale: active ? 1.08 : 0.88 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
      style={{ filter: active ? `drop-shadow(0px 2px 4px ${shadowColor})` : 'none' }}
    >
      <defs>
        <linearGradient id={`rb-${id}`} x1="4" y1="8" x2="24" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={colorLight} />
          <stop offset="100%" stopColor={colorDark} />
        </linearGradient>
        <linearGradient id={`rh-${id}`} x1="8" y1="2" x2="12" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={colorLight} />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
        <linearGradient id={`rbg-${id}`} x1="18" y1="2" x2="26" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF6F61" />
          <stop offset="100%" stopColor="#ff4757" />
        </linearGradient>
      </defs>
      {/* Cart handle */}
      <path d="M9 9L10 4H18L19 9" stroke={`url(#rh-${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Cart body - 3D perspective */}
      <path d="M4 9H24L22 21H6L4 9Z" fill={`url(#rb-${id})`} />
      {/* 3D top face */}
      <path d="M4 9H24L23.5 11H4.5L4 9Z" fill={colorLight} opacity="0.5" />
      {/* 3D right side */}
      <path d="M22 21L24 9L23.5 11L21.5 21H22Z" fill={colorDark} opacity="0.3" />
      {/* Body highlight */}
      <path d="M6 11L7.5 19H8L6.5 11H6Z" fill="white" opacity="0.15" />
      {/* Left wheel */}
      <circle cx="9.5" cy="24" r="2" fill={colorDark} />
      <circle cx="9.5" cy="24" r="1.2" fill={color} />
      <circle cx="9.5" cy="24" r="0.5" fill={colorLight} opacity="0.6" />
      {/* Right wheel */}
      <circle cx="18.5" cy="24" r="2" fill={colorDark} />
      <circle cx="18.5" cy="24" r="1.2" fill={color} />
      <circle cx="18.5" cy="24" r="0.5" fill={colorLight} opacity="0.6" />
      {/* Active glow */}
      {active && (
        <path d="M4 9H24L22 21H6L4 9Z" fill="white" opacity="0.1" />
      )}
      {/* Item count badge */}
      {(itemCount ?? 0) > 0 && (
        <>
          <circle cx="22" cy="5" r="5.5" fill={`url(#rbg-${id})`} />
          <circle cx="22" cy="5" r="5.5" fill="white" opacity="0.15" />
          <text
            x="22"
            y="5"
            textAnchor="middle"
            dominantBaseline="central"
            fill="white"
            fontSize="7"
            fontWeight="bold"
            fontFamily="system-ui"
          >
            {itemCount}
          </text>
        </>
      )}
    </motion.svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 3D HEART / FAVORITES ICON
// ═══════════════════════════════════════════════════════════════════════
export function Nav3DHeartIcon({ active, darkMode, itemCount }: Nav3DIconProps & { itemCount?: number }) {
  const color = active ? '#FF6F61' : (darkMode ? '#6B7280' : '#9CA3AF');
  const colorLight = active ? '#FF8A7A' : (darkMode ? '#4B5563' : '#B0B8C4');
  const colorDark = active ? '#E5534B' : (darkMode ? '#374151' : '#7A8494');
  const shadowColor = active ? 'rgba(255,111,97,0.4)' : 'transparent';
  const id = active ? 'fa' : 'fi';

  return (
    <motion.svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{ scale: active ? 1.08 : 0.88 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
      style={{ filter: active ? `drop-shadow(0px 2px 5px ${shadowColor})` : 'none' }}
    >
      <defs>
        <linearGradient id={`fm-${id}`} x1="4" y1="4" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={colorLight} />
          <stop offset="100%" stopColor={colorDark} />
        </linearGradient>
        <radialGradient id={`fs-${id}`} cx="0.35" cy="0.3" r="0.5" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="white" stopOpacity="0.35" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`fbg-${id}`} x1="18" y1="2" x2="26" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF6F61" />
          <stop offset="100%" stopColor="#E5534B" />
        </linearGradient>
      </defs>
      {/* Heart shadow (3D depth) */}
      <path d="M14 24L4.5 14.5C2 12 2 7.5 5 5.5C7.5 4 10.5 5 14 8C17.5 5 20.5 4 23 5.5C26 7.5 26 12 23.5 14.5L14 24Z"
        fill={colorDark} opacity="0.2" transform="translate(0.5, 0.5)" />
      {/* Main heart */}
      <path d="M14 24L4.5 14.5C2 12 2 7.5 5 5.5C7.5 4 10.5 5 14 8C17.5 5 20.5 4 23 5.5C26 7.5 26 12 23.5 14.5L14 24Z"
        fill={`url(#fm-${id})`} />
      {/* 3D Shine overlay */}
      <path d="M14 24L4.5 14.5C2 12 2 7.5 5 5.5C7.5 4 10.5 5 14 8C17.5 5 20.5 4 23 5.5C26 7.5 26 12 23.5 14.5L14 24Z"
        fill={`url(#fs-${id})`} />
      {/* Left highlight (3D curved surface) */}
      <path d="M7 7C8.5 5.5 11 5.5 14 8.5C11 6.5 9 6.5 7.5 7.5C6.5 8.5 6 10.5 7 13L5.5 11.5C4 9.5 5 8 7 7Z"
        fill="white" opacity="0.25" />
      {/* Active: filled with pulse glow */}
      {active && (
        <>
          <path d="M14 24L4.5 14.5C2 12 2 7.5 5 5.5C7.5 4 10.5 5 14 8C17.5 5 20.5 4 23 5.5C26 7.5 26 12 23.5 14.5L14 24Z"
            fill="white" opacity="0.12" />
          {/* Sparkle */}
          <circle cx="10" cy="9" r="1" fill="white" opacity="0.5" />
        </>
      )}
      {/* Favorites count badge */}
      {(itemCount ?? 0) > 0 && (
        <>
          <circle cx="22" cy="5" r="5.5" fill={`url(#fbg-${id})`} />
          <circle cx="22" cy="5" r="5.5" fill="white" opacity="0.15" />
          <text
            x="22"
            y="5"
            textAnchor="middle"
            dominantBaseline="central"
            fill="white"
            fontSize="7"
            fontWeight="bold"
            fontFamily="system-ui"
          >
            {itemCount}
          </text>
        </>
      )}
    </motion.svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 3D USER / PROFILE ICON
// ═══════════════════════════════════════════════════════════════════════
export function Nav3DUserIcon({ active, darkMode }: Nav3DIconProps) {
  const color = active ? (darkMode ? '#00C4E8' : '#004B63') : (darkMode ? '#6B7280' : '#9CA3AF');
  const colorLight = active ? (darkMode ? '#33D4F0' : '#007B8A') : (darkMode ? '#4B5563' : '#B0B8C4');
  const colorDark = active ? (darkMode ? '#0098B8' : '#003547') : (darkMode ? '#374151' : '#7A8494');
  const shadowColor = active ? (darkMode ? 'rgba(0,196,232,0.35)' : 'rgba(0,75,99,0.35)') : 'transparent';
  const id = active ? 'ua' : 'ui';

  return (
    <motion.svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{ scale: active ? 1.08 : 0.88 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
      style={{ filter: active ? `drop-shadow(0px 2px 4px ${shadowColor})` : 'none' }}
    >
      <defs>
        <linearGradient id={`uh-${id}`} x1="10" y1="3" x2="18" y2="13" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={colorLight} />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
        <linearGradient id={`ub-${id}`} x1="3" y1="16" x2="25" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={colorLight} />
          <stop offset="100%" stopColor={colorDark} />
        </linearGradient>
        <radialGradient id={`us-${id}`} cx="0.4" cy="0.3" r="0.5" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="white" stopOpacity="0.3" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Body shadow (3D depth) */}
      <path d="M14 15C8 15 3 19 3 24.5V26H25V24.5C25 19 20 15 14 15Z"
        fill={colorDark} opacity="0.15" transform="translate(0.5, 0.5)" />
      {/* Body */}
      <path d="M14 15C8 15 3 19 3 24.5V26H25V24.5C25 19 20 15 14 15Z"
        fill={`url(#ub-${id})`} />
      {/* Body 3D shine */}
      <path d="M14 15C8 15 3 19 3 24.5V26H25V24.5C25 19 20 15 14 15Z"
        fill={`url(#us-${id})`} />
      {/* 3D body highlight */}
      <path d="M8 18C9 16.5 11 15.5 14 15.5C12 16 10 17 9 18.5C7.5 20.5 7 23 7 25H5.5C5.5 22 6 19.5 8 18Z"
        fill="white" opacity="0.12" />
      {/* Head shadow */}
      <circle cx="14.5" cy="8.5" r="5.5" fill={colorDark} opacity="0.15" />
      {/* Head */}
      <circle cx="14" cy="8" r="5.5" fill={`url(#uh-${id})`} />
      {/* Head 3D shine */}
      <circle cx="14" cy="8" r="5.5" fill={`url(#us-${id})`} />
      {/* Head highlight arc */}
      <path d="M10 6C10.5 4.5 12 3.5 14 3.5C12.5 4 11.5 5 11 6.5C10.5 8 11 10 12 11L10.5 10C9.5 8.5 9.5 7 10 6Z"
        fill="white" opacity="0.2" />
      {/* Active glow */}
      {active && (
        <>
          <circle cx="14" cy="8" r="5.5" fill="white" opacity="0.08" />
          <path d="M14 15C8 15 3 19 3 24.5V26H25V24.5C25 19 20 15 14 15Z" fill="white" opacity="0.08" />
        </>
      )}
    </motion.svg>
  );
}
