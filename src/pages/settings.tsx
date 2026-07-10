import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Topbar } from '@/components/layout/topbar';
import { StageManager } from '@/components/settings/stage-manager';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { jsonToCsv, downloadCsv, parseCsv } from '@/lib/csv-utils';
import type { Currency, LeadSource } from '@/lib/types';
import { toast } from 'sonner';
import { Download, Upload, RotateCcw, Trash2, Command } from 'lucide-react';

export function SettingsPage() {
  const clients = useAppStore((s) => s.clients);
  const deals = useAppStore((s) => s.deals);
  const defaultCurrency = useAppStore((s) => s.defaultCurrency);
  const setDefaultCurrency = useAppStore((s) => s.setDefaultCurrency);
  const resetToDemoData = useAppStore((s) => s.resetToDemoData);
  const clearAllData = useAppStore((s) => s.clearAllData);

  const [resetOpen, setResetOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [clearConfirmText, setClearConfirmText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const clearInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (clearOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset confirmation text when dialog opens
      setClearConfirmText('');
      setTimeout(() => clearInputRef.current?.focus(), 50);
    }
  }, [clearOpen]);

  const handleExport = () => {
    const clientsCsv = jsonToCsv(clients as unknown as Record<string, unknown>[]);
    const dealsCsv = jsonToCsv(deals as unknown as Record<string, unknown>[]);
    downloadCsv('clients.csv', clientsCsv);
    downloadCsv('deals.csv', dealsCsv);
    toast.success('Data exported successfully');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        const rows = parseCsv(content);
        const addClient = useAppStore.getState().addClient;
        let imported = 0;

        rows.forEach((row) => {
          if (row.name && row.email) {
            addClient({
              name: row.name,
              company: row.company || '',
              email: row.email,
              phone: row.phone || '',
              leadSource: (row.leadSource as LeadSource) || 'Other',
              tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()) : [],
              notes: row.notes || '',
            });
            imported++;
          }
        });

        toast.success(`Imported ${imported} clients`);
      } catch {
        toast.error('Failed to parse CSV');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <Topbar title="Settings" />

      <div className="p-6 max-w-2xl space-y-6">
        {/* Pipeline Stages */}
        <StageManager />

        {/* Preferences */}
        <div className="rounded-xl bg-[#18181b] border border-white/5 p-6">
          <h3 className="text-sm font-medium text-white mb-4">Preferences</h3>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Default Currency</label>
            <select
              value={defaultCurrency}
              onChange={(e) => setDefaultCurrency(e.target.value as Currency)}
              className="h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#6366f1]/50"
            >
              <option value="INR">INR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>

        {/* Data Management */}
        <div className="rounded-xl bg-[#18181b] border border-white/5 p-6">
          <h3 className="text-sm font-medium text-white mb-4">Data Management</h3>
          <div className="space-y-3">
            <button
              onClick={handleExport}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors text-left"
            >
              <Download className="w-4 h-4 text-[#6366f1]" />
              <div>
                <p className="text-sm text-white">Export all data</p>
                <p className="text-xs text-white/40">Download clients.csv and deals.csv</p>
              </div>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors text-left"
            >
              <Upload className="w-4 h-4 text-emerald-500" />
              <div>
                <p className="text-sm text-white">Import clients from CSV</p>
                <p className="text-xs text-white/40">Upload a CSV file with client data</p>
              </div>
            </button>
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />

            <button
              onClick={() => setResetOpen(true)}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors text-left"
            >
              <RotateCcw className="w-4 h-4 text-amber-500" />
              <div>
                <p className="text-sm text-white">Reset to demo data</p>
                <p className="text-xs text-white/40">Replace all current data with sample data</p>
              </div>
            </button>

            <button
              onClick={() => setClearOpen(true)}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors text-left"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              <div>
                <p className="text-sm text-red-400">Clear all data</p>
                <p className="text-xs text-red-400/60">Permanently delete all data</p>
              </div>
            </button>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="rounded-xl bg-[#18181b] border border-white/5 p-6">
          <h3 className="text-sm font-medium text-white mb-4">Keyboard Shortcuts</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-sm text-white/70">Open command palette</span>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-xs text-white/50 font-mono">
                  <Command className="w-3 h-3 inline" />
                </kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-xs text-white/50 font-mono">K</kbd>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-white/70">Close modal or panel</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-xs text-white/50 font-mono">
                Esc
              </kbd>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset to Demo Data"
        description="This will replace all current data with sample data. This action cannot be undone."
        confirmLabel="Reset"
        onConfirm={() => {
          resetToDemoData();
          toast.success('Demo data restored');
        }}
      />

      <ConfirmDialog
        open={clearOpen}
        onOpenChange={(v) => { if (!v) setClearConfirmText(''); setClearOpen(v); }}
        title="Clear All Data"
        description="This will permanently delete all your data. This action cannot be undone."
        confirmLabel="Delete Everything"
        destructive
        confirmDisabled={clearConfirmText !== 'DELETE'}
        onConfirm={() => {
          clearAllData();
          setClearOpen(false);
          setClearConfirmText('');
          toast.success('All data cleared');
        }}
      >
        <div className="mt-3">
          <label htmlFor="clear-confirm-input" className="text-sm text-white/70 block mb-2">
            Type <strong className="text-red-400">DELETE</strong> to confirm:
          </label>
          <input
            ref={clearInputRef}
            id="clear-confirm-input"
            value={clearConfirmText}
            onChange={(e) => setClearConfirmText(e.target.value)}
            placeholder="Type DELETE"
            aria-describedby="clear-confirm-hint"
            className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-red-500/50"
          />
          <p id="clear-confirm-hint" className="text-xs text-white/30 mt-1">
            {clearConfirmText !== 'DELETE' ? 'Type DELETE to enable the button' : 'Ready to delete'}
          </p>
        </div>
      </ConfirmDialog>
    </div>
  );
}
