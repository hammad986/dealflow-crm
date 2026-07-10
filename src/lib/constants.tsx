import type { ReactNode } from 'react';
import { Phone, Mail, Users, FileText, ArrowRightCircle } from 'lucide-react';

export const ACTIVITY_ICONS: Record<string, ReactNode> = {
  call: <Phone className="w-3.5 h-3.5" />,
  email: <Mail className="w-3.5 h-3.5" />,
  meeting: <Users className="w-3.5 h-3.5" />,
  note: <FileText className="w-3.5 h-3.5" />,
  stage_change: <ArrowRightCircle className="w-3.5 h-3.5" />,
};

export const ACTIVITY_COLORS: Record<string, string> = {
  call: '#3b82f6',
  email: '#a855f7',
  meeting: '#f59e0b',
  note: '#71717a',
  stage_change: '#22c55e',
};

export const CURRENCY_LOCALES: Record<string, string> = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'de-DE',
};