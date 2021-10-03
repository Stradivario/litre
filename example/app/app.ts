import { html as lhtml } from "https://cdn.esm.sh/v53/lit-html@2.0.0";

import { LitElement } from "https://cdn.esm.sh/v53/lit-element@3.0.0";

class AppRoot extends LitElement {
  public static is() {
    return "app-root";
  }
  render() {
    return lhtml`Hello from SSR Webcomponents using Deno!`;
  }
}

export default {
  root: AppRoot,
  page: html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <title>"My app"</title>
      </head>
      <body>
        <app-root></app-root>
      </body>
    </html>
  `,
};
