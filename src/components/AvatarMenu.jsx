import { useState } from "react";
import T from "../constants/theme";
import useLang from "../hooks/useLang";

const AvatarMenu = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const { s: ls } = useLang();

  const items = [
    {
      label: ls.avatarMenu.premium,
      color: "#F9E04B",
      icon: (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path
            d="M6.5 1L8 5L12 5L9 8L10 12L6.5 9.5L3 12L4 8L1 5L5 5Z"
            stroke="#F9E04B"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      label: ls.avatarMenu.settings,
      color: T.text,
      icon: (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <circle cx="6.5" cy="6.5" r="2" stroke="currentColor" strokeWidth="1.3" />
          <path
            d="M6.5 1v1.2M6.5 10.8V12M1 6.5h1.2M10.8 6.5H12M2.6 2.6l.85.85M9.55 9.55l.85.85M2.6 10.4l.85-.85M9.55 3.45l.85-.85"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      label: ls.avatarMenu.help,
      color: T.text,
      icon: (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.3" />
          <path
            d="M5 5c0-1 .7-1.5 1.5-1.5S8 4 8 5c0 .8-.5 1.2-1 1.5C6.5 7 6.5 7.5 6.5 8"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <circle cx="6.5" cy="10" r=".7" fill="currentColor" />
        </svg>
      ),
    },
    {
      label: ls.avatarMenu.logout,
      color: T.red,
      action: onLogout,
      icon: (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path
            d="M8.5 4.5 L11.5 6.5 L8.5 8.5"
            stroke="#E63946"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M11.5 6.5H5" stroke="#E63946" strokeWidth="1.3" strokeLinecap="round" />
          <path
            d="M5 2H2.5C1.7 2 1 2.7 1 3.5v6C1 10.3 1.7 11 2.5 11H5"
            stroke="#E63946"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <div style={{ position: "relative" }}>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          overflow: "hidden",
          background: `linear-gradient(135deg, ${T.amber}, ${T.orange})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: T.display,
          fontSize: 14,
          color: T.black,
          cursor: "pointer",
          flexShrink: 0,
          boxShadow: open ? `0 0 0 2px ${T.amber}` : `0 0 0 1px ${T.amber}44`,
          transition: "box-shadow .2s",
        }}
      >
        {user?.avatar}
      </div>

      {open && (
        <>
          {/* Overlay */}
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 300 }} />

          {/* Dropdown */}
          <div
            style={{
              position: "absolute",
              top: 42,
              right: 0,
              zIndex: 301,
              background: T.s1,
              border: `1px solid ${T.border}`,
              borderRadius: 16,
              overflow: "hidden",
              width: 220,
              boxShadow: "0 8px 40px rgba(0,0,0,0.8)",
              animation: "fadeup .15s ease",
            }}
          >
            {/* User info */}
            <div style={{ padding: "14px 16px 12px", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ fontFamily: T.body, fontSize: 14, fontWeight: 600, color: T.text }}>
                {user?.name || ls.avatarMenu.fallbackUser}
              </div>
              <div style={{ fontFamily: T.mono, fontSize: 12, color: T.muted, marginTop: 2 }}>
                {user?.email || ls.avatarMenu.fallbackEmail}
              </div>
              <div
                style={{
                  marginTop: 8,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  background: T.amberGlow,
                  border: `1px solid ${T.amber}33`,
                  borderRadius: 6,
                  padding: "2px 8px",
                }}
              >
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.amber }} />
                <span style={{ fontFamily: T.mono, fontSize: 12, color: T.amber, letterSpacing: 0.5 }}>
                  {ls.avatarMenu.planFree}
                </span>
              </div>
            </div>

            {/* Menu items */}
            {items.map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  setOpen(false);
                  item.action && item.action();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "13px 16px",
                  background: "transparent",
                  border: "none",
                  borderBottom: i < items.length - 1 ? `1px solid ${T.border}` : "none",
                  cursor: "pointer",
                  fontFamily: T.body,
                  fontSize: 14,
                  color: item.color || T.text,
                  transition: "background .1s",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = T.s2)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ color: item.color || T.muted, opacity: 0.8, flexShrink: 0 }}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AvatarMenu;
