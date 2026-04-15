import { createRoot } from 'react-dom/client';
import ConfirmModal from '../components/ConfirmModal';

// Retourne 'confirm' | 'cancel' | 'tertiary'
export function confirmDialog(opts) {
  return new Promise((resolve) => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    const root = createRoot(div);
    const cleanup = (val) => {
      root.unmount();
      div.remove();
      resolve(val);
    };
    root.render(
      <ConfirmModal
        {...opts}
        onConfirm={() => cleanup('confirm')}
        onCancel={() => cleanup('cancel')}
        onTertiary={() => cleanup('tertiary')}
      />
    );
  });
}
