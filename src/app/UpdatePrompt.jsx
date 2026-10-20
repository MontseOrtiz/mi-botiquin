import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import Button from '../components/ui/Button.jsx';

export default function UpdatePrompt({ hasOpenForm = false }) {
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
    ? hasOpenForm
      ? 'Hay una actualización disponible. Guardá o cancelá el formulario antes de actualizar.'
      : 'Hay una actualización disponible.'
    : readyOffline
      ? 'La app está lista para usarse sin conexión.'
      : isOffline
        ? 'Estás sin conexión. Si es la primera vez, conectate para cargar la app.'
        : '';

  if (!message) return null;

  return (
    <aside className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-xl flex-wrap items-center justify-between gap-3 rounded-xl border border-fog-gray bg-paper-white p-4" aria-label="Avisos de la aplicación">
      <p className="text-base" role="status" aria-live="polite">{message}</p>
      {hasUpdate && (
        <Button onClick={() => updateServiceWorker(true)} disabled={hasOpenForm}>Actualizar</Button>
      )}
      {(readyOffline || isOffline) && !hasUpdate && (
        <Button variant="ghost" onClick={() => { setReadyOffline(false); setIsOffline(false); }}>
          Cerrar aviso
        </Button>
      )}
    </aside>
  );
}
