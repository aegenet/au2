/**
 * @vitest-environment jsdom
 */
import { getViewModel, renderInDOM } from './helper';
import { DemoPage } from '../dev-app/demo-page';
import { DemoPage2 } from '../dev-app/demo-page-2';
import { RouterConfiguration, Router, ViewportCustomElement } from '@aurelia/router';
import { I18nConfiguration } from '@aurelia/i18n';
import { CustomElement } from '@aurelia/runtime-html';

describe('base-page', () => {
  const DemoPageCE = CustomElement.define(
    {
      name: 'wrapper',
      template: `<au-viewport></au-viewport>`,
    },
    class {
      static routes: any = [
        {
          path: '',
          component: DemoPage,
          title: 'Home',
        },
        {
          path: 'p2',
          component: DemoPage2,
          title: 'Page 2',
        },
      ];
    }
  );

  it('Without I18N', async () => {
    await renderInDOM(DemoPageCE, [RouterConfiguration, DemoPage], async result => {
      const vm = getViewModel<ViewportCustomElement>(result);
      expect(vm).toBeTruthy();
      expect(result.textContent).toBe('Demo! Page!');
      const demoPage: DemoPage = (<Router>(vm as any).router).activeComponents[0].component.instance as DemoPage;
      expect(demoPage).toBeTruthy();
      expect(demoPage.i18n).toBeFalsy();
      expect(demoPage.ea).toBeTruthy();
      expect(demoPage.taskQueue).toBeTruthy();
      expect(demoPage.router).toBeTruthy();
    });
  });

  it('Without Router (?!)', async () => {
    await renderInDOM('<demo-page></demo-page>', [DemoPage], async result => {
      const demoPage = getViewModel<DemoPage>(result);
      expect(demoPage).toBeTruthy();
      expect(demoPage.i18n).toBeFalsy();
      expect(demoPage.ea).toBeTruthy();
      expect(demoPage.taskQueue).toBeTruthy();
      expect(demoPage.router).toBeFalsy();
    });
  });

  it('Ok', async () => {
    await renderInDOM(
      DemoPageCE,
      [
        RouterConfiguration,
        I18nConfiguration.customize(options => {
          options.initOptions = {
            resources: {
              en: { translation: { key: 'Hello I18N' } },
              de: { translation: { key: 'Hallo I18N' } },
            },
          };
        }),
        DemoPage,
      ],
      async result => {
        const vm = getViewModel<ViewportCustomElement>(result);
        expect(vm).toBeTruthy();
        expect(result.textContent).toBe('Demo! Page!');
        const demoPage: DemoPage = (<Router>(vm as any).router).activeComponents[0].component.instance as DemoPage;
        expect(demoPage).toBeTruthy();
        expect(demoPage.i18n).toBeTruthy();
        expect(demoPage.ea).toBeTruthy();
        expect(demoPage.taskQueue).toBeTruthy();
        expect(demoPage.router).toBeTruthy();

        // demoPage.unloading();
      }
    );
  });

  it('Loading, unloading', async () => {
    await renderInDOM(
      DemoPageCE,
      [
        RouterConfiguration,
        I18nConfiguration.customize(options => {
          options.initOptions = {
            resources: {
              en: { translation: { key: 'Hello I18N' } },
              de: { translation: { key: 'Hallo I18N' } },
            },
          };
        }),
        DemoPage,
      ],
      async result => {
        const vm = getViewModel<ViewportCustomElement>(result);
        expect(vm).toBeTruthy();
        expect(result.textContent).toBe('Demo! Page!');
        const demoPage: DemoPage = (<Router>(vm as any).router).activeComponents[0].component.instance as DemoPage;
        expect(demoPage).toBeTruthy();
        expect(demoPage.i18n).toBeTruthy();
        expect(demoPage.ea).toBeTruthy();
        expect(demoPage.taskQueue).toBeTruthy();
        expect(demoPage.router).toBeTruthy();
        expect(demoPage.router.activeNavigation.title).toBe('Home | Aurelia');

        await demoPage.router.load('p2');
        await result.$aurelia!.waitForIdle();
        expect(result.textContent).toBe('Demo! Page 2!');
        const demoPage2: DemoPage2 = (<Router>(vm as any).router).activeComponents[0].component.instance as DemoPage2;
        expect(demoPage2).toBeTruthy();
        expect(demoPage2.i18n).toBeTruthy();
        expect(demoPage2.ea).toBeTruthy();
        expect(demoPage2.taskQueue).toBeTruthy();
        expect(demoPage2.router).toBeTruthy();
        expect(demoPage2.router.activeNavigation.title).toBe('Page 2 | Aurelia');
        // demoPage.unloading();
      }
    );
  });
});
