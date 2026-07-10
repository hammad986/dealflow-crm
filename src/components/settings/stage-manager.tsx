import { useState, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import type { StageId, PipelineStage } from '@/lib/types';
import { GripVertical, Trash2, Pencil, Check, X } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

const PRESET_COLORS = [
  '#71717a', '#3b82f6', '#a855f7', '#f59e0b',
  '#22c55e', '#ef4444', '#ec4899', '#14b8a6',
];

const TERMINAL_STAGES: StageId[] = ['won', 'lost'];

// ---------------------------------------------------------------------------
// SortableStageRow
// ---------------------------------------------------------------------------

interface SortableStageRowProps {
  stage: PipelineStage;
  dealCount: number;
  editingId: StageId | null;
  editName: string;
  colorPickerId: StageId | null;
  onEditNameChange: (value: string) => void;
  onStartRename: (stage: PipelineStage) => void;
  onConfirmRename: (id: StageId) => void;
  onCancelRename: () => void;
  onToggleColorPicker: (id: StageId) => void;
  onPickColor: (id: StageId, color: string) => void;
  onRequestDelete: (stage: PipelineStage) => void;
}

function SortableStageRow({
  stage,
  dealCount,
  editingId,
  editName,
  colorPickerId,
  onEditNameChange,
  onStartRename,
  onConfirmRename,
  onCancelRename,
  onToggleColorPicker,
  onPickColor,
  onRequestDelete,
}: SortableStageRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stage.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isTerminal = TERMINAL_STAGES.includes(stage.id);
  const canDelete = dealCount === 0 && !isTerminal;
  const isDisabled = !canDelete;

  const deleteTooltip = isTerminal
    ? 'Cannot delete terminal stage'
    : 'Move all deals out first';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group flex items-center gap-3 p-3 rounded-lg
        bg-white/[0.02] border border-white/5
        transition-opacity
        ${isDragging ? 'opacity-50 z-50' : ''}
      `}
      {...attributes}
    >
      {/* Grip handle – only visible on hover */}
      <button
        className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-white/20 hover:text-white/40 shrink-0"
        aria-label="Drag to reorder"
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Color Swatch */}
      <div className="relative">
        <button
          onClick={() => onToggleColorPicker(stage.id)}
          className="w-6 h-6 rounded-full border-2 border-white/10 shrink-0"
          style={{ backgroundColor: stage.color }}
          aria-label="Change color"
        />
        {colorPickerId === stage.id && (
          <div className="absolute top-8 left-0 z-10 p-2 rounded-lg bg-[#0f0f13] border border-white/10 shadow-xl grid grid-cols-4 gap-1">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => onPickColor(stage.id, color)}
                className="w-6 h-6 rounded-full border border-white/10 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Name (inline edit or display) */}
      {editingId === stage.id ? (
        <div className="flex-1 flex items-center gap-2">
          <input
            autoFocus
            value={editName}
            onChange={(e) => onEditNameChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onConfirmRename(stage.id)}
            className="flex-1 h-8 px-2 rounded bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#6366f1]/50"
          />
          <button
            onClick={() => onConfirmRename(stage.id)}
            className="text-[#6366f1]"
            aria-label="Confirm rename"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={onCancelRename}
            className="text-white/40"
            aria-label="Cancel rename"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          <span className="flex-1 text-sm text-white select-none">
            {stage.name}
          </span>
          <button
            onClick={() => onStartRename(stage)}
            className="text-white/30 hover:text-white/60 transition-colors"
            aria-label="Rename stage"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </>
      )}

      {/* Deal count */}
      <span className="text-xs text-white/40 tabular-nums shrink-0">
        {dealCount} deal{dealCount !== 1 ? 's' : ''}
      </span>

      {/* Delete */}
      {isDisabled ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0}>
              <button
                disabled
                className="text-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Delete stage"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </span>
          </TooltipTrigger>
          <TooltipContent
            side="left"
            className="bg-[#27272a] text-white/80 border border-white/10"
          >
            {deleteTooltip}
          </TooltipContent>
        </Tooltip>
      ) : (
        <button
          onClick={() => onRequestDelete(stage)}
          className="text-white/20 hover:text-red-400 transition-colors"
          aria-label="Delete stage"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// StageManager
// ---------------------------------------------------------------------------

export function StageManager() {
  const stages = useAppStore((s) => s.stages);
  const deals = useAppStore((s) => s.deals);
  const renameStage = useAppStore((s) => s.renameStage);
  const recolorStage = useAppStore((s) => s.recolorStage);
  const reorderStages = useAppStore((s) => s.reorderStages);
  const deleteStage = useAppStore((s) => s.deleteStage);

  const [editingId, setEditingId] = useState<StageId | null>(null);
  const [editName, setEditName] = useState('');
  const [colorPickerId, setColorPickerId] = useState<StageId | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PipelineStage | null>(null);

  const getDealCount = useCallback(
    (stageId: StageId) => deals.filter((d) => d.stageId === stageId).length,
    [deals],
  );

  // -- Rename handlers -------------------------------------------------------

  const handleStartRename = useCallback((stage: PipelineStage) => {
    setEditingId(stage.id);
    setEditName(stage.name);
  }, []);

  const handleConfirmRename = useCallback(
    (id: StageId) => {
      const trimmed = editName.trim();
      if (trimmed) {
        renameStage(id, trimmed);
      }
      setEditingId(null);
    },
    [editName, renameStage],
  );

  const handleCancelRename = useCallback(() => {
    setEditingId(null);
  }, []);

  // -- Color handlers --------------------------------------------------------

  const handleToggleColorPicker = useCallback(
    (id: StageId) => {
      setColorPickerId((prev) => (prev === id ? null : id));
    },
    [],
  );

  const handlePickColor = useCallback(
    (id: StageId, color: string) => {
      recolorStage(id, color);
      setColorPickerId(null);
    },
    [recolorStage],
  );

  // -- Delete handlers -------------------------------------------------------

  const handleRequestDelete = useCallback((stage: PipelineStage) => {
    setPendingDelete(stage);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (pendingDelete) {
      deleteStage(pendingDelete.id);
      setPendingDelete(null);
    }
  }, [pendingDelete, deleteStage]);

  const handleCancelDelete = useCallback(() => {
    setPendingDelete(null);
  }, []);

  // -- DnD handlers ----------------------------------------------------------

  const stageIds: StageId[] = stages.map((s) => s.id);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = stageIds.indexOf(active.id as StageId);
      const newIndex = stageIds.indexOf(over.id as StageId);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(stageIds, oldIndex, newIndex);
      reorderStages(reordered);
    },
    [stageIds, reorderStages],
  );

  // -- Render ----------------------------------------------------------------

  return (
    <>
      <div className="rounded-xl bg-[#18181b] border border-white/5 p-6">
        <h3 className="text-sm font-medium text-white mb-4">Pipeline Stages</h3>

        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={stageIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {stages.map((stage) => (
                <SortableStageRow
                  key={stage.id}
                  stage={stage}
                  dealCount={getDealCount(stage.id)}
                  editingId={editingId}
                  editName={editName}
                  colorPickerId={colorPickerId}
                  onEditNameChange={setEditName}
                  onStartRename={handleStartRename}
                  onConfirmRename={handleConfirmRename}
                  onCancelRename={handleCancelRename}
                  onToggleColorPicker={handleToggleColorPicker}
                  onPickColor={handlePickColor}
                  onRequestDelete={handleRequestDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) handleCancelDelete();
        }}
        title="Delete Stage"
        description={`Are you sure you want to delete "${pendingDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}