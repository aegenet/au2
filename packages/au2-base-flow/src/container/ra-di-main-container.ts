import { DI, EventAggregator, IContainer, Key, Registration } from '@aurelia/kernel';
import { DIRaEventAggregator } from '../event/i-ra-event-aggregator';
import { DIRaTaskFlow } from '../event/i-ra-task-flow';
import { RaTaskFlow } from '../event/ra-task-flow';

/**
 * DIContainer, contient le container de plugin entre autre
 */
class RaDIMainContainer {
  public static readonly _mainContainer: IContainer = DI.createContainer();
  private static readonly _children: IContainer[] = [];

  private constructor() {
    /** */
  }

  /** Créé un container enfant */
  public static create(...params: unknown[]): IContainer {
    const newContainer = RaDIMainContainer._mainContainer.createChild({
      inheritParentResources: false,
    });

    // Nous mettons dans tous les cas notre RaEventAggregator
    newContainer.register(Registration.singleton(DIRaTaskFlow, RaTaskFlow));
    // Nous mettons dans tous les cas aussi l'event aggregator
    newContainer.register(Registration.singleton(DIRaEventAggregator, EventAggregator));
    // Ainsi que tous les services
    newContainer.register(params);

    RaDIMainContainer._children.push(newContainer);
    return newContainer;
  }

  /**
   * Récupère les containers enfants
   * @returns
   */
  public static getChildren(): IContainer[] {
    return RaDIMainContainer._children;
  }

  /**
   * Récupère toutes les instances des types souhaitées
   * @returns
   */
  public static getAll<K extends Key>(key: K | Key): K[] {
    const data: K[] = [];

    RaDIMainContainer._children.forEach(f => {
      if (f.has<K>(key, false)) {
        f.getAll(key).forEach(a => {
          data.push(a);
        });
      }
    });

    return data;
  }

  /** Supprime un container enfant */
  public static remove(container: IContainer): RaDIMainContainer {
    const idx = RaDIMainContainer._children.indexOf(container);
    if (idx !== -1) {
      container.dispose();
      RaDIMainContainer._children.splice(idx, 1);
    }

    return this;
  }

  /** Supprime tous les enfants */
  public static removeAll(): RaDIMainContainer {
    RaDIMainContainer._children.forEach(c => {
      c.dispose();
    });
    RaDIMainContainer._children.length = 0;
    return this;
  }
}

export { RaDIMainContainer as DIMainContainer };
