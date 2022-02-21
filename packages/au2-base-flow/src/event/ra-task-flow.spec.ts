import { IContainer } from '@aurelia/kernel';
import { DIRaTaskFlow, IRaTaskFlow } from './i-ra-task-flow';
import { DIMainContainer } from '../container/ra-di-main-container';
import * as assert from 'assert';

/** Delay operation */
function delay(duration: number): Promise<void> {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve();
    }, duration);
  });
}

const commonBefore = global.before ?? global.beforeAll;
const commonAfter = global.after ?? global.afterAll;

describe('ra-task-flow', () => {
  let container: IContainer;
  let eventAggregator: IRaTaskFlow;
  commonBefore(() => {
    container = DIMainContainer.create();
    eventAggregator = container.get(DIRaTaskFlow);
  });

  commonAfter(() => {
    eventAggregator = undefined;
    DIMainContainer.remove(container);
  });

  it('Register & publish', async () => {
    const tabs: string[] = [];
    eventAggregator.subscribe('toto', async () => {
      await delay(200);
      tabs.push('le delay');
    });
    eventAggregator.subscribe('toto', async () => {
      tabs.push('sans delay');
    });

    await eventAggregator.publish('toto');

    assert.deepEqual(tabs, ['le delay', 'sans delay']);
  });

  it('Register & publish with order', async () => {
    const tabs: string[] = [];
    eventAggregator.subscribe('toto', async () => {
      await delay(200);
      tabs.push('le delay');
    });
    eventAggregator.subscribe(
      'toto',
      async () => {
        tabs.push('sans delay');
      },
      { order: 0 }
    );

    await eventAggregator.publish('toto');

    assert.deepEqual(tabs, ['sans delay', 'le delay']);
  });

  it('RegisterOnce & publish', async () => {
    const tabs: string[] = [];
    eventAggregator.subscribeOnce('toto', async () => {
      await delay(200);
      tabs.push('le delay');
    });
    eventAggregator.subscribeOnce('toto', async () => {
      tabs.push('sans delay');
    });

    await eventAggregator.publish('toto');

    assert.deepEqual(tabs, ['le delay', 'sans delay']);
  });
});
