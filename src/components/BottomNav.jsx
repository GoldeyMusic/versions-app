import { useState } from 'react';
import T from '../constants/theme';
import { IconHome, IconHistory, IconQuestion, IconSettings } from './Icons';
import useLang from '../hooks/useLang';

export default function BottomNav({ active, onChange, onAsk }) {
  const { s } = useLang();
  const tabs = [
    { id: 'input', label: s.nav.home, Icon: IconHome },
    { id: 'historique', label: s.nav.versions, Icon: IconHistory },
    { id: 'ask', label: s.nav.chat, Icon: IconQuestion },
    { id: 'reglages', label: s.nav.reglages, Icon: IconSettings },
  ];

  return (
    <nav
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'sticky',
        bottom: 0,
        zIndex: 500,
        display: 'flex',
        alignItems: 'stretch',
        background: 'rgba(7,7,7,0.98)',
        backdropFilter: 'blur(16px)',
        borderTop: `1px solid ${T.border}`,
        padding: '0 4px',
        paddingBottom: 'env(safe-area-inset-bottom,0px)',
      }}
    >
      {tabs.map(({ id, label, Icon }) => {
        const isActive = active === id;
        const color = isActive ? T.amber : T.muted;
        return (
          <button
            key={id}
            onClick={() => (id === 'ask' ? onAsk() : onChange(id))}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              padding: '10px 0 8px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all .2s',
            }}
          >
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '25%',
                  right: '25%',
                  height: 2,
                  borderRadius: '0 0 2px 2px',
                  background: T.amber,
                }}
              />
            )}
            <Icon c={color} s={18} />
            <span
              style={{
                fontFamily: T.mono,
                fontSize: 9,
                letterSpacing: 0.5,
                color,
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
