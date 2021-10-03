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
export default class extends HTMLElement {
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
```
