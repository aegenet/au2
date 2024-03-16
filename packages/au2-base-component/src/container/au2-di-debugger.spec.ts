import { type IContainer, DI, Registration, IEventAggregator, EventAggregator } from '@aurelia/kernel';
import * as assert from 'node:assert';
import { debugContainer } from './au2-di-debugger';

describe('au2-di-debugger', () => {
  it('null/undefined container', async () => {
    assert.deepStrictEqual(debugContainer(null), {
      instance: [],
      singleton: [],
      transient: [],
      callback: [],
      array: [],
      alias: [],
    });
    assert.deepStrictEqual(debugContainer(undefined), {
      instance: [],
      singleton: [],
      transient: [],
      callback: [],
      array: [],
      alias: [],
    });
  });

  it('empty container', async () => {
    assert.deepStrictEqual(debugContainer(undefined), {
      instance: [],
      singleton: [],
      transient: [],
      callback: [],
      array: [],
      alias: [],
    });
  });

  it('with an instance', async () => {
    const container: IContainer = DI.createContainer();
    container.register(Registration.instance('Something', 'Else'));

    // 1) Explore without getting
    const stats = debugContainer(container);
    assert.strictEqual(stats.instance.length, 1);
    assert.deepStrictEqual(stats.instance[0], {
      Something: {
        resolving: false,
        current: 'Else',
      },
    });
    assert.strictEqual(stats.alias.length, 0);
    assert.strictEqual(stats.array.length, 0);
    assert.strictEqual(stats.callback.length, 0);
    assert.strictEqual(stats.transient.length, 0);

    // 2) Get & explore (same result as before)
    const ev = container.get('Something');
    assert.ok(ev);
    const stats2 = debugContainer(container);
    assert.strictEqual(stats2.singleton.length, 0);
    assert.strictEqual(stats2.instance.length, 1);
    assert.deepStrictEqual(stats2.instance[0], {
      Something: {
        resolving: false,
        current: 'Else',
      },
    });
    assert.strictEqual(stats2.alias.length, 0);
    assert.strictEqual(stats2.array.length, 0);
    assert.strictEqual(stats2.callback.length, 0);
    assert.strictEqual(stats2.transient.length, 0);
  });

  it('with a singleton', async () => {
    const container: IContainer = DI.createContainer();
    container.register(Registration.singleton(IEventAggregator, EventAggregator));

    // 1) Explore without getting
    const stats = debugContainer(container);
    assert.strictEqual(stats.instance.length, 0);
    assert.strictEqual(stats.singleton.length, 1);
    assert.deepStrictEqual(stats.singleton[0], {
      IEventAggregator: {
        resolving: false,
        current: EventAggregator,
      },
    });
    assert.strictEqual(stats.alias.length, 0);
    assert.strictEqual(stats.array.length, 0);
    assert.strictEqual(stats.callback.length, 0);
    assert.strictEqual(stats.transient.length, 0);

    // 2) Get & explore (singleton to be resolved & moved to "instance")
    const ev = container.get(IEventAggregator);
    assert.ok(ev);
    const stats2 = debugContainer(container);
    assert.strictEqual(stats2.singleton.length, 0);
    assert.strictEqual(stats2.instance.length, 1);
    assert.deepStrictEqual(stats2.instance[0], {
      IEventAggregator: {
        resolving: false,
        current: ev,
      },
    });
    assert.strictEqual(stats2.alias.length, 0);
    assert.strictEqual(stats2.array.length, 0);
    assert.strictEqual(stats2.callback.length, 0);
    assert.strictEqual(stats2.transient.length, 0);
  });

  it('with a callback', async () => {
    const container: IContainer = DI.createContainer();
    let callCount = 0;
    const cb = () => 'Hello ' + ++callCount;
    container.register(Registration.callback('Callback2Me', cb));

    // 1) Explore without getting
    const stats = debugContainer(container);
    assert.strictEqual(stats.instance.length, 0);
    assert.strictEqual(stats.callback.length, 1);
    assert.deepStrictEqual(stats.callback[0], {
      Callback2Me: {
        resolving: false,
        current: cb,
      },
    });
    assert.strictEqual(stats.alias.length, 0);
    assert.strictEqual(stats.array.length, 0);
    assert.strictEqual(stats.singleton.length, 0);
    assert.strictEqual(stats.transient.length, 0);

    // 2) Get & explore (same result as before)
    const cbRes = container.get('Callback2Me');
    assert.strictEqual(cbRes, 'Hello 1');

    const stats2 = debugContainer(container);
    assert.strictEqual(stats2.instance.length, 0);
    assert.strictEqual(stats2.callback.length, 1);
    assert.deepStrictEqual(stats2.callback[0], {
      Callback2Me: {
        resolving: false,
        current: cb,
      },
    });
    assert.strictEqual(stats2.alias.length, 0);
    assert.strictEqual(stats2.array.length, 0);
    assert.strictEqual(stats2.singleton.length, 0);
    assert.strictEqual(stats2.transient.length, 0);

    assert.strictEqual(container.get('Callback2Me'), 'Hello 2');
    assert.strictEqual(container.get('Callback2Me'), 'Hello 3');
  });

  it('with a cachedCallback', async () => {
    const container: IContainer = DI.createContainer();
    let callCount = 0;
    const cb = () => 'Hello ' + ++callCount;
    container.register(Registration.cachedCallback('Callback2Me', cb));

    // 1) Explore without getting
    const stats = debugContainer(container);
    assert.strictEqual(stats.instance.length, 0);
    assert.strictEqual(stats.callback.length, 1);
    assert.ok(stats.callback[0].Callback2Me);
    assert.strictEqual(stats.callback[0].Callback2Me.resolving, false);
    assert.ok(typeof stats.callback[0].Callback2Me.current === 'function');
    assert.strictEqual(stats.alias.length, 0);
    assert.strictEqual(stats.array.length, 0);
    assert.strictEqual(stats.singleton.length, 0);
    assert.strictEqual(stats.transient.length, 0);

    // 2) Get & explore (the callback result is cached)
    const cbRes = container.get('Callback2Me');
    assert.strictEqual(cbRes, 'Hello 1');

    const stats2 = debugContainer(container);
    assert.strictEqual(stats2.instance.length, 0);
    assert.strictEqual(stats2.callback.length, 1);
    assert.ok(stats2.callback[0].Callback2Me);
    assert.strictEqual(stats2.callback[0].Callback2Me.resolving, false);
    assert.ok(typeof stats2.callback[0].Callback2Me.current === 'function');
    assert.strictEqual(stats2.alias.length, 0);
    assert.strictEqual(stats2.array.length, 0);
    assert.strictEqual(stats2.singleton.length, 0);
    assert.strictEqual(stats2.transient.length, 0);

    assert.strictEqual(container.get('Callback2Me'), 'Hello 1');
    assert.strictEqual(container.get('Callback2Me'), 'Hello 1');
  });

  it('with transient (new instance per injection)', async () => {
    const container: IContainer = DI.createContainer();
    let callCount = 0;
    class Something {
      public name = 'Something ' + ++callCount;
    }

    container.register(Registration.transient('New2Me', Something));

    // 1) Explore without getting
    const stats = debugContainer(container);
    assert.strictEqual(stats.instance.length, 0);
    assert.strictEqual(stats.callback.length, 0);
    assert.strictEqual(stats.transient.length, 1);
    assert.ok(stats.transient[0].New2Me);
    assert.strictEqual(stats.transient[0].New2Me.resolving, false);
    assert.ok(typeof stats.transient[0].New2Me.current === 'function');
    assert.strictEqual(stats.alias.length, 0);
    assert.strictEqual(stats.array.length, 0);
    assert.strictEqual(stats.singleton.length, 0);

    // 2) Get & explore (new instance for each get call)
    const cbRes = container.get<Something>('New2Me');
    assert.strictEqual(cbRes.name, 'Something 1');

    const stats2 = debugContainer(container);
    assert.strictEqual(stats2.instance.length, 0);
    assert.strictEqual(stats2.transient.length, 1);
    assert.ok(stats2.transient[0].New2Me);
    assert.strictEqual(stats2.transient[0].New2Me.resolving, false);
    assert.ok(typeof stats2.transient[0].New2Me.current === 'function');
    assert.strictEqual(stats2.alias.length, 0);
    assert.strictEqual(stats2.array.length, 0);
    assert.strictEqual(stats2.singleton.length, 0);
    assert.strictEqual(stats2.callback.length, 0);

    assert.strictEqual(container.get<Something>('New2Me').name, 'Something 2');
    assert.strictEqual(container.get<Something>('New2Me').name, 'Something 3');
  });

  it('with an alias', async () => {
    const container: IContainer = DI.createContainer();
    let callCount = 0;
    class Something {
      public name = 'Something ' + ++callCount;
    }

    container.register(Registration.transient('New2Me', Something));
    container.register(Registration.aliasTo('New2Me', 'New2U'));

    // 1) Explore without getting
    const stats = debugContainer(container);
    assert.strictEqual(stats.instance.length, 0);
    assert.strictEqual(stats.callback.length, 0);
    assert.strictEqual(stats.transient.length, 1);
    assert.ok(stats.transient[0].New2Me);
    assert.strictEqual(stats.transient[0].New2Me.resolving, false);
    assert.ok(typeof stats.transient[0].New2Me.current === 'function');
    assert.strictEqual(stats.alias.length, 1);
    assert.deepStrictEqual(stats.alias[0], {
      New2U: {
        resolving: false,
        current: 'New2Me',
      },
    });
    assert.strictEqual(stats.array.length, 0);
    assert.strictEqual(stats.singleton.length, 0);

    // 2) Get & explore (new instance for each get call)
    const cbRes = container.get<Something>('New2U');
    assert.strictEqual(cbRes.name, 'Something 1');

    const stats2 = debugContainer(container);
    assert.strictEqual(stats2.instance.length, 0);
    assert.strictEqual(stats2.transient.length, 1);
    assert.ok(stats2.transient[0].New2Me);
    assert.strictEqual(stats2.transient[0].New2Me.resolving, false);
    assert.ok(typeof stats2.transient[0].New2Me.current === 'function');
    assert.strictEqual(stats2.alias.length, 1);
    assert.deepStrictEqual(stats.alias[0], {
      New2U: {
        resolving: false,
        current: 'New2Me',
      },
    });
    assert.strictEqual(stats2.array.length, 0);
    assert.strictEqual(stats2.singleton.length, 0);
    assert.strictEqual(stats2.callback.length, 0);

    assert.strictEqual(container.get<Something>('New2U').name, 'Something 2');
    assert.strictEqual(container.get<Something>('New2U').name, 'Something 3');
  });

  it.skip('with array', async () => {
    // ?
  });
});
