import {
  unshim,
  domShimSymbol,
} from 'https://cdn.spooky.click/dom-shim/1.3.0/mod.js?global&props=customElements,document,window,Document,Element,HTMLElement,HTMLTemplateElement,Node,requestAnimationFrame,Text';
// import { isLit, shimLit } from './shim-lit.js';

const { document } = self[domShimSymbol];

const window = document.defaultView;
const DOMParser = window.DOMParser;

const ShadowPrototype = document
  .createElement('div')
  .attachShadow({ mode: 'open' }).constructor.prototype;
const _innerhtml = Symbol('ocean.innerhtmlshim');
Object.defineProperty(ShadowPrototype, 'innerHTML', {
  get() {
    return this[_innerhtml];
  },
  set(val) {
    this[_innerhtml] = val;
    const parser = new DOMParser();
    const doc = parser.parseFromString(val, 'text/html');
    this.replaceChildren(...doc.childNodes);
  },
  configurable: true,
});

/**
 * This part is broken we cannot render component inside of component <app-cmp><my-cmp></my-cmp></app-cmp>
 * Thus it is commented out
 */
// const customElementsDefine = window.customElements.define;
// // deno-lint-ignore no-unused-vars
// function overrideElementShim(name, Ctr) {
//   if(isLit(Ctr)) {
//     shimLit(Ctr);
//   }
//   return customElementsDefine.apply(this, arguments);
// }

// Object.defineProperty(window.customElements, 'define', {
//   value: overrideElementShim,
//   configurable: true
// });

const url = new URL(import.meta.url);
if (!url.searchParams.has('global')) {
  unshim();
}

export { unshim };
