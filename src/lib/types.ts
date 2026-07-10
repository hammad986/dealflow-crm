export type Currency = 'INR' | 'USD' | 'EUR';

export type LeadSource = 'Referral' | 'LinkedIn' | 'WhatsApp' | 'Website' | 'Cold Outreach' | 'Other';

export type StageId = 'new_lead' | 'contacted' | 'proposal_sent' | 'negotiation' | 'won' | 'lost';

export type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'stage_change';

export type LostReason = 'Budget' | 'Timing' | 'Chose competitor' | 'No response' | 'Other';

export interface PipelineStage {
  id: StageId;
  name: string;
  color: string;
  order: number;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  leadSource: LeadSource;
  tags: string[];
  notes: string;
  createdAt: string;
}

export interface Deal {
  id: string;
  clientId: string;
  title: string;
  value: number;
  currency: Currency;
  stageId: StageId;
  expectedCloseDate: string;
  createdAt: string;
  stageEnteredAt: string;
  wonAt?: string;
  lostAt?: string;
  lostReason?: LostReason;
}

export interface Activity {
  id: string;
  clientId: string;
  dealId?: string;
  type: ActivityType;
  content: string;
  createdAt: string;
}

export interface FollowUpTask {
  id: string;
  clientId: string;
  dealId?: string;
  title: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface AppState {
  clients: Client[];
  deals: Deal[];
  activities: Activity[];
  tasks: FollowUpTask[];
  stages: PipelineStage[];
  defaultCurrency: Currency;
  hydrated: boolean;
}

export interface AppActions {
  addClient: (data: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addDeal: (data: Omit<Deal, 'id' | 'createdAt' | 'stageEnteredAt'>) => Deal;
  updateDeal: (id: string, data: Partial<Deal>) => void;
  moveDeal: (dealId: string, newStageId: StageId) => void;
  deleteDeal: (id: string) => void;
  addActivity: (data: Omit<Activity, 'id' | 'createdAt'>) => Activity;
  updateActivity: (id: string, data: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
  addTask: (data: Omit<FollowUpTask, 'id' | 'createdAt' | 'completed'>) => FollowUpTask;
  completeTask: (id: string) => void;
  uncompleteTask: (id: string) => void;
  deleteTask: (id: string) => void;
  deleteStage: (id: StageId) => void;
  reorderStages: (newOrder: StageId[]) => void;
  renameStage: (id: StageId, name: string) => void;
  recolorStage: (id: StageId, color: string) => void;
  setDefaultCurrency: (currency: Currency) => void;
  resetToDemoData: () => void;
  clearAllData: () => void;
  setHydrated: (value: boolean) => void;
}

export type ViewMode = 'table' | 'grid';

export type DateRange = '30d' | '90d' | '6m' | 'all';

export const STAGE_COLORS: Record<StageId, string> = {
  new_lead: '#71717a',
  contacted: '#3b82f6',
  proposal_sent: '#a855f7',
  negotiation: '#f59e0b',
  won: '#22c55e',
  lost: '#ef4444',
};

export const STAGE_LABELS: Record<StageId, string> = {
  new_lead: 'New Lead',
  contacted: 'Contacted',
  proposal_sent: 'Proposal Sent',
  negotiation: 'Negotiation',
  won: 'Won',
  lost: 'Lost',
};

export const LEAD_SOURCE_COLORS: Record<LeadSource, string> = {
  Referral: '#22c55e',
  LinkedIn: '#3b82f6',
  WhatsApp: '#22c55e',
  Website: '#a855f7',
  'Cold Outreach': '#f59e0b',
  Other: '#71717a',
};
