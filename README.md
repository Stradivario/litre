<div align="center">
  <br />
  <img src="https://lit.dev/images/logo.svg" height="250" />
  <h1>Litre</h1>
  <strong>Deno + LitHTML: No build, no bundle, all streaming</strong>
  <br /><br />
</div>


**Litre** is a web framework intended to work with LitHTML and SSR

Embrace the future of **ES Modules**, **Import Maps**, and **Web
Streams**. 

### Starting Litre server

```typescript
import litre from 'https://raw.githubusercontent.com/Stradivario/litre/master/src/mod.ts';

litre({
  importmap: await Deno.readTextFile('importmap.json'),
  folder: 'app',
  port: 4200,
});
```

```bash
make dev
```

### Example
```typescript

class AppRoot extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    const div = document.createElement("div");
    div.innerHTML = `Hello from SSR Webcomponents using Deno!`;
    this.shadowRoot?.append(div);
  }
}

customElements.define('app-root', AppRoot)

export default {
  page: ({ render }) => render`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <title>My app</title>
      </head>
      <body>
        <app-root></app-root>
      </body>
    </html>
  `,
};
```


### LitHTML

```typescript
import {
  html,
  Component,
  LitElement,
} from "https://cdn.esm.sh/v53/@rxdi/lit-html@0.7.127";

import { RenderConfigLitre } from 'https://raw.githubusercontent.com/Stradivario/litre/master/src/types.ts';

@Component({
  selector: "app-root",
  template(this) {
    return html`Hello from SSR Webcomponents using Deno!`;
  },
})
export class AppRoot extends LitElement {}

export default {
  page: (ctx) => ctx.render`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <title>My app</title>
      </head>
      <body>
        <app-root></app-root>
      </body>
    </html>
  `,
} as RenderConfigLitre;
```