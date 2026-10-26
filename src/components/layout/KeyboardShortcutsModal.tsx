import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';

export interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const shortcuts = [
    { key: 'Cmd / Ctrl + K', description: 'Open the global Command Palette' },
    { key: '?', description: 'Display this keyboard shortcuts help modal' },
    { key: 'Esc', description: 'Dismiss any open modal, drawer, or menu' },
    { key: 'Tab', description: 'Advance focus to next interactive element' },
    { key: 'Shift + Tab', description: 'Move focus to previous interactive element' },
    { key: 'Space / Enter', description: 'Activate buttons, checkboxes, and links' },
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Navigation Shortcuts"
      description="Project Camp is engineered for high-velocity keyboard accessibility."
      footer={
        <Button variant="primary" size="sm" onClick={onClose}>
          Understood
        </Button>
      }
    >
      <div className="space-y-3">
        <div className="border border-border rounded-sm divide-y divide-border overflow-hidden">
          {shortcuts.map((sc) => (
            <div key={sc.key} className="flex items-center justify-between p-2.5 text-xs">
              <span className="text-text-muted">{sc.description}</span>
              <kbd className="px-2 py-1 font-mono text-[11px] font-semibold text-text bg-surface-raised border border-border rounded-xs shrink-0 ml-4">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </Dialog>
  );
}
