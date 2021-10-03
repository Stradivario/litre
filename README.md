<div align="center">
  <br />
  <img src="https://lit.dev/images/logo.svg" height="250" />
  <h1>Litre</h1>
  <strong>Deno + LitHTML: No build, no bundle, all streaming</strong>
  <br /><br />
</div>


**Litre** is a web framework that leans hard into your browser's native
features.

Embrace the future of **ES Modules**, **Import Maps**, and **Web
Streams**. 



### Starting Deno server

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
