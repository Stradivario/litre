
import { ButtonComponent } from 'https://cdn.esm.sh/v53/@rxdi/ui-kit@0.7.128/button';
ButtonComponent;
// customElements.define('rx-button', ButtonComponent)
console.log(customElements.get('rx-button'))
customElements.define('app-component', class extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }
  connectedCallback() {
    const div = document.createElement("div");
    div.innerHTML = `Hello from SSR Webcompdadaonents using Deno!`;
    this.shadowRoot?.append(div);
  }
});

export default {
  page: () => Ocean.html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <link rel="icon" type="image/x-icon" href="https://graphql-server.com/favicon.aa477cee.ico"/>
        <title>My app</title>
          <style>
          :root {
            --danger-bg-color: #f0506e;
            --danger-color: #fff;
            --danger-border: 1px solid transparent;
            --danger-hover-color: #ee395b;
            --danger-active-color: #ec2147;
          }
          </style>
      </head>
      <body>
        <app-component></app-component>
        <rx-button palette="danger">TEST</rx-button>
      </body>
    </html>
  `,
};
