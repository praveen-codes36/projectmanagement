import { Toaster as SonnerToaster, toast } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        className:
          '!bg-surface !text-text !border !border-border !rounded-sm !shadow-lg !font-sans !text-xs !py-3 !px-4',
        descriptionClassName: '!text-text-muted',
      }}
    />
  );
}

export { toast };
