import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAppStore } from '@/lib/store';
import { Topbar } from '@/components/layout/topbar';
import { KanbanBoard } from '@/components/pipeline/kanban-board';
import { NewDealModal } from '@/components/pipeline/new-deal-modal';
import { LostReasonModal } from '@/components/pipeline/lost-reason-modal';
import type { Deal, LeadSource, StageId } from '@/lib/types';
import { LEAD_SOURCE_COLORS } from '@/lib/types';
import { EmptyState } from '@/components/shared/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, SlidersHorizontal, X, ChevronDown, Check } from 'lucide-react';

const ALL_LEAD_SOURCES: LeadSource[] = [
  'Referral',
  'LinkedIn',
  'WhatsApp',
  'Website',
  'Cold Outreach',
  'Other',
];

function countActiveFilters(
  searchQuery: string,
  selectedSources: string[],
  selectedStages: string[],
  valueRange: { min: string; max: string },
): number {
  let count = 0;
  if (searchQuery.trim().length > 0) count++;
  if (selectedSources.length > 0) count++;
  if (selectedStages.length > 0) count++;
  if (valueRange.min.trim().length > 0) count++;
  if (valueRange.max.trim().length > 0) count++;
  return count;
}

/** A tiny dropdown-with-checkboxes for Lead Source selection. */
function LeadSourceDropdown({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (sources: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const toggleSource = (source: string) => {
    onChange(
      selected.includes(source)
        ? selected.filter((s) => s !== source)
        : [...selected, source],
    );
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white/70 hover:bg-white/10 transition-colors"
      >
        <span className="truncate">
          {selected.length === 0
            ? 'Lead Source'
            : selected.length === 1
              ? selected[0]
              : `${selected.length} sources`}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-white/50 shrink-0" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 w-52 rounded-lg bg-[#1c1c24] border border-white/10 shadow-xl shadow-black/30 py-1 animate-in fade-in-0 zoom-in-95 duration-100">
          {ALL_LEAD_SOURCES.map((source) => {
            const isChecked = selected.includes(source);
            return (
              <label
                key={source}
                className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => toggleSource(source)}
              >
                <span
                  className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${
                    isChecked
                      ? 'bg-[#6366f1] border-[#6366f1]'
                      : 'border-white/20'
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3 text-white" />}
                </span>
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: LEAD_SOURCE_COLORS[source] }}
                />
                <span className="text-sm text-white/80">{source}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Toggle buttons for pipeline stages. */
function StageToggles({
  stages,
  selected,
  onChange,
}: {
  stages: { id: StageId; name: string; color: string }[];
  selected: string[];
  onChange: (stages: string[]) => void;
}) {
  const toggleStage = (stageId: string) => {
    onChange(
      selected.includes(stageId)
        ? selected.filter((s) => s !== stageId)
        : [...selected, stageId],
    );
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {stages.map((stage) => {
        const isActive = selected.includes(stage.id);
        return (
          <button
            key={stage.id}
            type="button"
            onClick={() => toggleStage(stage.id)}
            className={`h-8 px-3 rounded-lg text-xs font-medium transition-all ${
              isActive
                ? 'text-white shadow-sm'
                : 'bg-white/5 border border-white/10 text-white/50 hover:text-white/70 hover:bg-white/10'
            }`}
            style={
              isActive
                ? { backgroundColor: `${stage.color}22`, borderColor: `${stage.color}55`, border: `1px solid ${stage.color}55`, color: stage.color }
                : undefined
            }
          >
            {stage.name}
          </button>
        );
      })}
    </div>
  );
}

export function PipelinePage() {
  const navigate = useNavigate();
  const hydrated = useAppStore((s) => s.hydrated);
  const clients = useAppStore((s) => s.clients);
  const deals = useAppStore((s) => s.deals);
  const stages = useAppStore((s) => s.stages);

  const [newDealOpen, setNewDealOpen] = useState(false);
  const [lostReasonOpen, setLostReasonOpen] = useState(false);
  const [pendingLostDeal, setPendingLostDeal] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [valueRange, setValueRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = countActiveFilters(searchQuery, selectedSources, selectedStages, valueRange);

  // Listen for command palette create-deal event
  useEffect(() => {
    const handler = () => setNewDealOpen(true);
    window.addEventListener('dealflow:create-deal', handler);
    return () => window.removeEventListener('dealflow:create-deal', handler);
  }, []);

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const client = clients.find((c) => c.id === deal.clientId);

      const matchesSearch =
        !searchQuery.trim() ||
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client?.company.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSource =
        selectedSources.length === 0 ||
        (client && selectedSources.includes(client.leadSource));

      const matchesStage =
        selectedStages.length === 0 ||
        selectedStages.includes(deal.stageId);

      const dealValue = deal.value;
      const matchesValue =
        (!valueRange.min.trim() || dealValue >= Number(valueRange.min)) &&
        (!valueRange.max.trim() || dealValue <= Number(valueRange.max));

      return matchesSearch && matchesSource && matchesStage && matchesValue;
    });
  }, [deals, clients, searchQuery, selectedSources, selectedStages, valueRange]);

  const handleLostDrop = useCallback((dealId: string) => {
    setPendingLostDeal(dealId);
    setLostReasonOpen(true);
  }, []);

  const handleLostReasonConfirm = (reason: string) => {
    if (pendingLostDeal) {
      useAppStore.getState().moveDeal(pendingLostDeal, 'lost');
      useAppStore.getState().updateDeal(pendingLostDeal, { lostReason: reason as Deal['lostReason'] });
    }
    setLostReasonOpen(false);
    setPendingLostDeal(null);
  };

  const handleLostReasonCancel = () => {
    setLostReasonOpen(false);
    setPendingLostDeal(null);
  };

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedSources([]);
    setSelectedStages([]);
    setValueRange({ min: '', max: '' });
  }, []);

  if (!hydrated) {
    return (
      <div className="flex-1 overflow-hidden">
        <Topbar title="Pipeline" />
        <div className="flex-1 p-6">
          <Skeleton className="h-full rounded-xl bg-white/5" />
        </div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="flex-1 overflow-hidden">
        <Topbar title="Pipeline" actionLabel="New Deal" onAction={() => setNewDealOpen(true)} />
        <div className="p-6">
          <EmptyState
            title="No clients yet"
            description="Add your first client to start building your pipeline."
            action={
              <button
                onClick={() => navigate('/clients')}
                className="px-4 py-2 rounded-lg bg-[#6366f1] hover:bg-[#5558e0] text-white text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add Client
              </button>
            }
          />
        </div>
        <NewDealModal open={newDealOpen} onOpenChange={setNewDealOpen} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Topbar
        title="Pipeline"
        searchPlaceholder="Search deals or clients..."
        onSearch={setSearchQuery}
        actionLabel="New Deal"
        onAction={() => setNewDealOpen(true)}
      >
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`relative flex items-center gap-2 h-9 px-3 rounded-lg border text-sm transition-colors ${
            showFilters || activeFilterCount > 0
              ? 'bg-[#6366f1]/15 border-[#6366f1]/30 text-[#a5b4fc]'
              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#6366f1] text-white text-[11px] font-semibold leading-none">
              {activeFilterCount}
            </span>
          )}
        </button>
      </Topbar>

      {/* Collapsible filter panel */}
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          showFilters ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 py-3 border-b border-white/5 space-y-3">
          {/* Row 1: Lead Source dropdown + Value Range */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40 font-medium uppercase tracking-wide">Source</span>
              <LeadSourceDropdown selected={selectedSources} onChange={setSelectedSources} />
            </div>

            <div className="w-px h-6 bg-white/10" />

            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40 font-medium uppercase tracking-wide">Value</span>
              <input
                type="number"
                placeholder="Min"
                value={valueRange.min}
                onChange={(e) => setValueRange((r) => ({ ...r, min: e.target.value }))}
                className="w-24 h-8 px-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6366f1]/50 focus:ring-1 focus:ring-[#6366f1]/20 transition-all"
              />
              <span className="text-white/30 text-xs">to</span>
              <input
                type="number"
                placeholder="Max"
                value={valueRange.max}
                onChange={(e) => setValueRange((r) => ({ ...r, max: e.target.value }))}
                className="w-24 h-8 px-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6366f1]/50 focus:ring-1 focus:ring-[#6366f1]/20 transition-all"
              />
            </div>
          </div>

          {/* Row 2: Stage toggles */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40 font-medium uppercase tracking-wide shrink-0">Stage</span>
            <StageToggles stages={stages} selected={selectedStages} onChange={setSelectedStages} />
          </div>

          {/* Row 3: Clear button + active count summary */}
          {activeFilterCount > 0 && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-white/40">
                Showing {filteredDeals.length} of {deals.length} deals
              </span>
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors"
              >
                <X className="w-3 h-3" />
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard deals={filteredDeals} onLostDrop={handleLostDrop} />
      </div>

      <NewDealModal open={newDealOpen} onOpenChange={setNewDealOpen} />
      <LostReasonModal
        open={lostReasonOpen}
        onOpenChange={setLostReasonOpen}
        onConfirm={handleLostReasonConfirm}
        onCancel={handleLostReasonCancel}
      />
    </div>
  );
}