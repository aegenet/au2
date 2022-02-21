import { DI } from "@aurelia/kernel";
import { RaTaskFlow } from "./ra-task-flow";

/**
 * EventAggregator partagé dans un container enfant
 */
export const DIRaTaskFlow = DI.createInterface<IRaTaskFlow>('ra.task-flow');

export interface IRaTaskFlow extends RaTaskFlow {}