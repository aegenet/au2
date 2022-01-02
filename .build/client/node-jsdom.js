const path = require('path');

function enhance() {
  if (!global.fetch) {
    global.fetch = require('node-fetch');
  }

  _patchFirePopstateOnRoute(global.window)
}



  // _patchDocument(document) {
  //   document.createRange = () => {
  //     const range = new this.global.Range();
    
  //     range.getBoundingClientRect = jest.fn();
    
  //     range.getClientRects = () => {
  //       return {
  //         item: () => null,
  //         length: 0,
  //         [Symbol.iterator]: jest.fn()
  //       };
  //     };
    
  //     range.startContainer.getBoundingClientRect = jest.fn();
    
  //     return range;
  //   }
  // }

function _patchFirePopstateOnRoute(window/*: Window*/)/*: void*/ {

  const { history } = window;
  const originalBack = history.back;
  const originalForwards = history.forward;
  const originalReplaceState = history.replaceState;

  history['__proto__'].back = function patchedBack(context/*: History*/, ...args/*: Parameters<History['back']>*/)/*: void*/ {
    originalBack.apply(context, args);

    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  history.__proto__.forward = function patchedForward(context/*: History*/, ...args/*: Parameters<History['forward']>*/)/*: void*/ {
    originalForwards.apply(context, args);

    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // history.__proto__.replaceState = function patchedReplaceState(context/*: History*/, ...args/*: Parameters<History['replaceState']>*/)/*: void*/ {
    
  //   // window.location.replace('http://localhost/')

  //   console.dir(args);
  //   originalReplaceState.apply(context, args);
  // };
}

module.exports = enhance;

// /* eslint-disable @typescript-eslint/no-var-requires */
// const jsdomGlobal = require('jsdom-global');
// const { BrowserPlatform } = require('@aurelia/platform-browser');

// /** Action à réaliser à la fermeture ou plantage de l'application */
// async function exitHandler(options /* : { cleanup? : boolean, exit? : boolean }*/, err /*: Error*/) {

//   console.dir(arguments);
//   if (typeof err === 'number') {
//     process.exit(err);
//   } else {
//     console.log(err.message);
//     if (err && err.stack) {
//       console.log(err.stack);
//     }
//     process.exit(0);
//   }
// }

// function setupNode()/*: void*/ {

//   //do something when app is closing
//   process.on('exit', exitHandler.bind(null, { cleanup: true }));
//   //catches ctrl+c event
//   process.on('SIGINT', exitHandler.bind(null, { exit: true }));
//   //catches uncaught exceptions
//   process.on('uncaughtException', exitHandler.bind(null, { exit: true }));



//   const p = Promise.resolve();
//   function $queueMicrotask(cb/*: () => void*/)/*: void*/ {
//     p.then(cb).catch(function (err) {
//       throw err;
//     });
//   }

//   // Element.prototype.animate = () => {
//   //   return {
//   //     finished: Promise.resolve()
//   //   } as unknown as Animation;
//   // };
//   const w = Object.assign(window);
//   // eslint-disable-next-line @typescript-eslint/no-var-requires
//   const nodeFetch = require('node-fetch');

//   // (PLATFORM.Element.prototype as any).$trueAttachShadow = Element.prototype.attachShadow;
//   // PLATFORM.Element.prototype.attachShadow = function(init: ShadowRootInit) : ShadowRoot {
//   //   if (init && init.mode === 'closed') {
//   //     init.mode = 'open';
//   //   }
//   //   return this.$trueAttachShadow(init);
//   // };

//   const platform = new BrowserPlatform(w, {
//     ShadowRoot: window.ShadowRoot,
//     requestAnimationFrame: (callback) => {
//       return window.setTimeout(callback, 0);
//     },
//     queueMicrotask: typeof w.queueMicrotask === 'function'
//       ? w.queueMicrotask.bind(w)
//       : $queueMicrotask,
//     // eslint-disable-next-line @typescript-eslint/no-var-requires
//     fetch: nodeFetch.default,
//   });

//   global.addEventListener('error', this.errorEventListener);

//   // However, don't report them as uncaught if the user listens to 'error' event.
//   // In that case, we assume the might have custom error handling logic.
//   const originalAddListener = global.addEventListener;
//   const originalRemoveListener = global.removeEventListener;
//   let userErrorListenerCount = 0;
//   global.addEventListener = function (
//     ...args
//   ) {
//     if (args[0] === 'error') {
//       userErrorListenerCount++;
//     }
//     return originalAddListener.apply(this, args);
//   };
//   global.removeEventListener = function (
//     ...args
//   ) {
//     if (args[0] === 'error') {
//       userErrorListenerCount--;
//     }
//     return originalRemoveListener.apply(this, args);
//   };

//   // declare const globalThis;
//   // eslint-disable-next-line no-undef
//   BrowserPlatform.set(globalThis, platform);

//   // Registration.instance(IPlatform, BrowserPlatform.getOrCreate(globalThis))
//   // console.log(jsdom.window.Element);

//   // console.dir(PLATFORM.Element);

//   // console.log(`Node JSDOM test context initialized`);
// }

// try {
//   jsdomGlobal(`<!DOCTYPE html><html><head><base href="http://localhost:7777/"></base></head><body><div></div></body></html>`, {
//     url: 'http://localhost:7777',
//     pretendToBeVisual: true,
//     runScripts: 'dangerously',
//     // resources: "usable",
//     // beforeParse(window) {
//     //   if (!window.fetch) {
//     //     window.fetch = require('node-fetch')
//     //   }
//     // }
//   });

//   // global.ShadowRoot = window.ShadowRoot;


//   setupNode();
// } catch (error) {
//   console.log(error);
//   process.exit(-1);
// }