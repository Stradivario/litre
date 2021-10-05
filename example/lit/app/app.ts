import {
  Component,
  html,
  LitElement,
} from 'https://cdn.esm.sh/v53/@rxdi/lit-html@0.7.127';

import 'https://cdn.esm.sh/v53/@rxdi/ui-kit/button';

@Component({
  selector: 'app-root',
  template(this) {
    return html`Hello from SSR Webcomponents using Deno!`;
  },
})
export class AppRoot extends LitElement {}

export default Litre({
  page: () => Ocean.html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>My app</title>
      </head>
      <body>
        <app-root></app-root>
        <rx-button>Test Button</rx-button>
      </body>
    </html>
  `,
});
