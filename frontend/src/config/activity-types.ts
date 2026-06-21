import { Ionicons } from '@expo/vector-icons';

export type ActivityTypeConfig = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  /** Routes that belong to this activity (for nav-bar active state detection). */
  childRoutes?: string[];
};

export const ACTIVITY_TYPES: ActivityTypeConfig[] = [
  {
    id: 'plans',
    title: 'Plans',
    description: 'Discover plans created by the community.',
    icon: 'calendar',
    route: '/search-plans',
    childRoutes: ['/search-plans', '/plan', '/create-plan'],
  },
  {
    id: 'tourist-places',
    title: 'Tourist Places',
    description: 'Explore tourist attractions and interesting places.',
    icon: 'location',
    route: '/turistic-places',
    childRoutes: ['/turistic-places', '/turistic-place'],
  },
];
