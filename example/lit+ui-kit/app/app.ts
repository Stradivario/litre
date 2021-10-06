import {
  Component,
  html,
  LitElement,
} from 'http://localhost:8080/@rxdi/lit-html';

@Component({
  selector: 'app-root',
  template(this) {
    return html`
      <rx-button palette="danger">Test Button</rx-button>
      <rx-accordion-item>
        <div slot="title">Why should i upgrade ?</div>
        <div slot="content">Optimized for best experience...</div>
      </rx-accordion-item> `;
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
        <script type="module">
          import 'http://localhost:8080/@rxdi/ui-kit/accordion-item';
          import 'http://localhost:8080/@rxdi/ui-kit/button';
          
          import { Bootstrap} from 'http://localhost:8080/@rxdi/core';
          import { ReactiveUiModule } from 'http://localhost:8080/@rxdi/ui-kit';
          Bootstrap(ReactiveUiModule.forRoot()).subscribe()
        </script>
      </head>
      <body>
        <app-root></app-root>
      </body>
    </html>
  `,
});
