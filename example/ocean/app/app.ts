import { RenderConfigLitre } from "https://raw.githubusercontent.com/Stradivario/litre/master/src/types.ts";

const Header = Ocean.html` <p>Header</p> `;

const Body = Ocean.html` <p>Hello from SSR HTML using Deno!</p> `;

const Footer = Ocean.html` <p>Footer</p> `;

export default {
  page: (opts) => opts.html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <link rel="icon" type="image/x-icon" href="https://graphql-server.com/favicon.aa477cee.ico"/>
        <title>My app</title>
      </head>
      <body>
        ${Header}
        ${Body}
        ${Footer}
      </body>
    </html>
  `,
} as RenderConfigLitre;
