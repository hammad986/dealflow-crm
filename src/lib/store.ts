import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AppState, AppActions, Client, Deal, Activity, FollowUpTask, Currency } from './types';
import { defaultStages, demoClients, demoDeals, demoActivities, demoTasks } from './seed-data';

const safeStorage = createJSONStorage(() => {
  try {
    const testKey = '__dealflow_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return localStorage;
  } catch {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    } as unknown as Storage;
  }
});

const generateId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

const createInitialState = (): AppState => ({
  clients: [...demoClients],
  deals: [...demoDeals],
  activities: [...demoActivities],
  tasks: [...demoTasks],
  stages: [...defaultStages],
  defaultCurrency: 'INR',
  hydrated: false,
});

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      ...createInitialState(),

      setHydrated: (value: boolean) => set({ hydrated: value }),

      addClient: (data) => {
        const client: Client = { ...data, id: generateId(), createdAt: new Date().toISOString() };
        set((state) => ({ clients: [...state.clients, client] }));
        return client;
      },

      updateClient: (id, data) => {
        set((state) => ({
          clients: state.clients.map((c) => (c.id === id ? { ...c, ...data } : c)),
        }));
      },

      deleteClient: (id) => {
        set((state) => ({
          clients: state.clients.filter((c) => c.id !== id),
          deals: state.deals.filter((d) => d.clientId !== id),
          activities: state.activities.filter((a) => a.clientId !== id),
          tasks: state.tasks.filter((t) => t.clientId !== id),
        }));
      },

      addDeal: (data) => {
        const deal: Deal = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
          stageEnteredAt: new Date().toISOString(),
        };
        set((state) => ({ deals: [...state.deals, deal] }));
        return deal;
      },

      updateDeal: (id, data) => {
        set((state) => ({
          deals: state.deals.map((d) => (d.id === id ? { ...d, ...data } : d)),
        }));
      },

      moveDeal: (dealId, newStageId) => {
        const state = get();
        const deal = state.deals.find((d) => d.id === dealId);
        if (!deal) return;

        const now = new Date().toISOString();
        const stageName = state.stages.find((s) => s.id === newStageId)?.name || newStageId;

        const updates: Partial<Deal> = {
          stageId: newStageId,
          stageEnteredAt: now,
        };

        if (newStageId === 'won') updates.wonAt = now;
        if (newStageId === 'lost') updates.lostAt = now;

        // Clear wonAt/lostAt when moving away
        if (deal.stageId === 'won' && newStageId !== 'won') updates.wonAt = undefined;
        if (deal.stageId === 'lost' && newStageId !== 'lost') updates.lostAt = undefined;

        const activity: Activity = {
          id: generateId(),
          clientId: deal.clientId,
          dealId: deal.id,
          type: 'stage_change',
          content: `Moved to ${stageName}`,
          createdAt: now,
        };

        set((state) => ({
          deals: state.deals.map((d) => (d.id === dealId ? { ...d, ...updates } : d)),
          activities: [activity, ...state.activities],
        }));
      },

      deleteDeal: (id) => {
        set((state) => ({
          deals: state.deals.filter((d) => d.id !== id),
          activities: state.activities.filter((a) => a.dealId !== id),
        }));
      },

      addActivity: (data) => {
        const activity: Activity = { ...data, id: generateId(), createdAt: new Date().toISOString() };
        set((state) => ({ activities: [activity, ...state.activities] }));
        return activity;
      },

      updateActivity: (id, data) => {
        set((state) => ({
          activities: state.activities.map((a) => (a.id === id ? { ...a, ...data } : a)),
        }));
      },

      deleteActivity: (id) => {
        set((state) => ({ activities: state.activities.filter((a) => a.id !== id) }));
      },

      addTask: (data) => {
        const task: FollowUpTask = { ...data, id: generateId(), completed: false, createdAt: new Date().toISOString() };
        set((state) => ({ tasks: [...state.tasks, task] }));
        return task;
      },

      completeTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, completed: true, completedAt: new Date().toISOString() } : t
          ),
        }));
      },

      uncompleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, completed: false, completedAt: undefined } : t
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
      },

      deleteStage: (id) => {
        set((state) => ({
          stages: state.stages
            .filter((s) => s.id !== id)
            .map((s, i) => ({ ...s, order: i })),
        }));
      },

      reorderStages: (newOrder) => {
        set((state) => ({
          stages: state.stages
            .map((s) => ({ ...s, order: newOrder.indexOf(s.id) }))
            .sort((a, b) => a.order - b.order),
        }));
      },

      renameStage: (id, name) => {
        set((state) => ({
          stages: state.stages.map((s) => (s.id === id ? { ...s, name } : s)),
        }));
      },

      recolorStage: (id, color) => {
        set((state) => ({
          stages: state.stages.map((s) => (s.id === id ? { ...s, color } : s)),
        }));
      },

      setDefaultCurrency: (currency: Currency) => set({ defaultCurrency: currency }),

      resetToDemoData: () => {
        set({
          clients: [...demoClients],
          deals: [...demoDeals],
          activities: [...demoActivities],
          tasks: [...demoTasks],
          stages: [...defaultStages],
        });
      },

      clearAllData: () => {
        set({
          clients: [],
          deals: [],
          activities: [],
          tasks: [],
          stages: [...defaultStages],
        });
      },
    }),
    {
      name: 'dealflow_crm_data',
      storage: safeStorage,
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);
