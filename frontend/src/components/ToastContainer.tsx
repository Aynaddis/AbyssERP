import { CheckCircle2, XCircle, X } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur-sm ${
            t.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-500'
              : 'bg-red-500/10 border-red-500/30 text-red-500'
          }`}
        >
          {t.type === 'success' ? (
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
          ) : (
            <XCircle size={16} className="shrink-0 mt-0.5" />
          )}
          <p className="flex-1 text-[var(--color-text)]">{t.message}</p>
          <button
            onClick={() => removeToast(t.id)}
            aria-label="Dismiss"
            className="shrink-0 text-[var(--color-muted)] hover:text-[var(--color-text)]"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}