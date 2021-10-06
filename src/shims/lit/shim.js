import { LitElementRenderer } from "./ssr.js";

export function isLit(Ctr) {
  return !!Ctr._$litElement$;
}

export function* litRender() {
  const instance = new LitElementRenderer(this.localName);

  for (const attr of this.attributes) {
    instance.setAttribute(attr.name, attr.value);
  }

  yield `<${this.localName}`;
  yield* instance.renderAttributes();
  yield `>`;
  // const shadowContents = instance.renderShadow({elementRenderers: [LitElementRenderer] });

  const shadowContents = instance.renderShadow({});

  if (shadowContents !== undefined) {
    yield '<template shadowroot="open">';
    yield* shadowContents;
    yield "</template>";
  }
  yield this.innerHTML;
  yield `</${this.localName}>`;

}

export function shimLit(Ctr) {
  Ctr.prototype.connectedCallback = Function.prototype;
  Ctr.prototype[Symbol.for("ocean.serialize")] = litRender;
}
