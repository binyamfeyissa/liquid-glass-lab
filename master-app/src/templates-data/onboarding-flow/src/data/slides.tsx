import type { ReactElement } from 'react';
import { AlertsVisual, AnalyticsVisual, SecurityVisual, TeamVisual } from '../components/visuals';

export interface Slide {
  id: string;
  headline: string;
  body: string;
  visual: () => ReactElement;
}

export const SLIDES: Slide[] = [
  {
    id: 'focus',
    headline: 'See where the week actually goes',
    body: 'Northwind turns calendars, docs and messages into a clear picture of focus time — no manual time tracking, and never surveillance.',
    visual: () => <AnalyticsVisual />,
  },
  {
    id: 'team',
    headline: 'Know who has room to help',
    body: 'Live availability and focus status for the whole team, so asking for a review never means breaking someone’s flow.',
    visual: () => <TeamVisual />,
  },
  {
    id: 'updates',
    headline: 'Only the updates that need you',
    body: 'Mentions, blockers and shipped work, summarised as they happen. Everything else waits quietly until you are ready for it.',
    visual: () => <AlertsVisual />,
  },
  {
    id: 'security',
    headline: 'Private and secure from day one',
    body: 'Your work data stays yours: SSO, hardware keys and granular controls, with analytics that report trends — never keystrokes.',
    visual: () => <SecurityVisual />,
  },
];
