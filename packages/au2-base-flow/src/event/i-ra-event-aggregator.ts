import { DI, IEventAggregator } from "@aurelia/kernel";

/**
 * EventAggregator partagé dans un container enfant
 */
export const DIRaEventAggregator = DI.createInterface<IEventAggregator>('ra.event-aggregator');
