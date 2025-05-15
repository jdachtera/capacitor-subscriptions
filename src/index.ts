import { registerPlugin } from '@capacitor/core';

import type { SubscriptionsPlugin } from './definitions.ts';

const Subscriptions = registerPlugin<SubscriptionsPlugin>('Subscriptions', {
  web: () => import('./web').then((m) => new m.SubscriptionsWeb()),
});

export * from './definitions';
export { Subscriptions };
