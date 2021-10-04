const Header = Ocean.html` <p>Header</p> `;

const Body = Ocean.html` <p>Hello from SSR HTML using Deno!</p> `;

const Footer = Ocean.html` <p>Footer</p> `;

export default {
  page: () => Ocean.html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <link rel="icon" type="image/x-icon" href="https://graphql-server.com/favicon.aa477cee.ico"/>
        <title>My app</title>
          <script type="module">
          import 'https://cdn.esm.sh/v53/@rxdi/ui-kit/button';
          </script>
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
        ${Header}
        ${Body}
        ${Footer}
        <rx-button palette="danger">TEST</rx-button>
      </body>
    </html>
  `,
};
