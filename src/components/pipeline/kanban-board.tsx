import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useAppStore } from '@/lib/store';
import type { Deal, StageId } from '@/lib/types';
import { KanbanColumn } from './kanban-column';
import { DealCard } from './deal-card';
import { DealDetailSheet } from './deal-detail-sheet';
import confetti from 'canvas-confetti';

interface KanbanBoardProps {
  deals: Deal[];
  onLostDrop: (dealId: string) => void;
}

export function KanbanBoard({ deals, onLostDrop }: KanbanBoardProps) {
  const stages = useAppStore((s) => s.stages);
  const moveDeal = useAppStore((s) => s.moveDeal);

  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [detailDeal, setDetailDeal] = useState<Deal | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const deal = deals.find((d) => d.id === event.active.id);
    if (deal) setActiveDeal(deal);
  }, [deals]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);

    if (!over) return;

    const dealId = active.id as string;
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) return;

    // Check if dropped over a column
    const stageId = over.id as StageId;
    const isStage = stages.some((s) => s.id === stageId);

    if (isStage && deal.stageId !== stageId) {
      if (stageId === 'lost') {
        onLostDrop(dealId);
        return;
      }

      moveDeal(dealId, stageId);

      if (stageId === 'won') {
        const rect = event.activatorEvent instanceof MouseEvent
          ? { clientX: event.activatorEvent.clientX, clientY: event.activatorEvent.clientY }
          : { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 };

        confetti({
          particleCount: 80,
          spread: 70,
          origin: {
            x: rect.clientX / window.innerWidth,
            y: rect.clientY / window.innerHeight,
          },
          colors: ['#6366f1', '#22c55e', '#f59e0b'],
        });
      }
    }
  }, [deals, stages, moveDeal, onLostDrop]);

  const openDealDetail = (deal: Deal) => {
    setDetailDeal(deal);
    setDetailOpen(true);
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-full overflow-x-auto overflow-y-hidden px-6 pb-4 gap-4" role="region" aria-label="Pipeline board">
          {stages.map((stage) => {
            const stageDeals = deals
              .filter((d) => d.stageId === stage.id)
              .sort((a, b) => new Date(b.stageEnteredAt).getTime() - new Date(a.stageEnteredAt).getTime());

            return (
              <KanbanColumn
                key={stage.id}
                stage={stage}
                deals={stageDeals}
                onDealClick={openDealDetail}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeDeal ? (
            <DealCard deal={activeDeal} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>

      {detailDeal && (
        <DealDetailSheet
          deal={detailDeal}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      )}
    </>
  );
}
