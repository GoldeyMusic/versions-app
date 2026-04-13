import T from '../constants/theme';
import { VersionsLogo } from './Icons';
import AvatarMenu from './AvatarMenu';

export default function Header({ onHome }) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        height: 52,
        borderBottom: `1px solid ${T.border}`,
        background: 'rgba(7,7,7,0.96)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexShrink: 0,
      }}
    >
      <div
        onClick={onHome}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
        }}
      >
        <VersionsLogo sz={0.8} />
        <span
          style={{
            fontFamily: T.display,
            fontSize: 18,
            letterSpacing: 5,
            color: T.amber,
          }}
        >
          VERSIONS
        </span>
      </div>
      <AvatarMenu />
    </header>
  );
}
