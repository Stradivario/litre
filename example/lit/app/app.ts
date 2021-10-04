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
  page: (opts) => opts.html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>My app</title>
      </head>
      <body>
        <app-root></app-root>
      </body>
    </html>
  `,
} as RenderConfigLitre;