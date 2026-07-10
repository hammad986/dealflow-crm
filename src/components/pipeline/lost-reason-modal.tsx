import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { LostReason } from '@/lib/types';

const reasons: LostReason[] = ['Budget', 'Timing', 'Chose competitor', 'No response', 'Other'];

interface LostReasonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export function LostReasonModal({ open, onOpenChange, onConfirm, onCancel }: LostReasonModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');

  const handleConfirm = () => {
    if (!selectedReason) return;
    onConfirm(selectedReason);
    setSelectedReason('');
  };

  const handleClose = () => {
    onCancel();
    setSelectedReason('');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); onOpenChange(v); }}>
      <DialogContent className="bg-[#18181b] border border-white/10 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white">Deal Lost</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <p className="text-sm text-white/60">Why was this deal lost?</p>

          <div className="space-y-1.5">
            {reasons.map((reason) => (
              <button
                key={reason}
                onClick={() => setSelectedReason(reason)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  selectedReason === reason
                    ? 'bg-[#6366f1]/15 text-[#6366f1] border border-[#6366f1]/30'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border border-transparent'
                }`}
              >
                {reason}
              </button>
            ))}
          </div>

          <button
            onClick={handleConfirm}
            disabled={!selectedReason}
            className="w-full h-10 rounded-lg bg-[#6366f1] hover:bg-[#5558e0] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            Confirm
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
