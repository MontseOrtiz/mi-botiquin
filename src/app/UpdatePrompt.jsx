import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import Button from '../components/ui/Button.jsx';

export default function UpdatePrompt() {
  const { needRefresh, offlineReady, updateServiceWorker } = useRegisterSW();
  const [hasUpdate, setHasUpdate] = needRefresh;
  const [readyOffline, setReadyOffline] = offlineReady;
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const updateOnlineState = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', updateOnlineState);
    window.addEventListener('offline', updateOnlineState);
    return () => {
      window.removeEventListener('online', updateOnlineState);
      window.removeEventListener('offline', updateOnlineState);
    };
  }, []);

  const message = hasUpdate
    ? 'Hay una actualización disponible.'
    : readyOffline
      ? 'La app está lista para usarse sin conexión.'
      : isOffline
        ? 'Estás sin conexión. Si es la primera vez, conectate para cargar la app.'
        : '';

  if (!message) return null;

  return (
    <aside className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-divider border-l-4 border-l-brand-herb bg-brand-surface p-4" aria-label="Avisos de la aplicación">
      <p className="min-w-0 flex-1 text-base text-brand-text" role="status" aria-live="polite">{message}</p>
      {hasUpdate && (
        <Button onClick={() => updateServiceWorker(true)}>Actualizar</Button>
      )}
      {(readyOffline || isOffline) && !hasUpdate && (
        <Button variant="ghost" onClick={() => { setReadyOffline(false); setIsOffline(false); }}>
          Cerrar aviso
        </Button>
      )}
    </aside>
  );
}
