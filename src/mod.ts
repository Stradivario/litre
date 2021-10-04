// deno-lint-ignore-file no-explicit-any
import { existsSync } from "https://deno.land/std@0.107.0/fs/mod.ts";
import { join } from "https://deno.land/std@0.107.0/path/mod.ts";
import LRU from "https://deno.land/x/lru@1.0.2/mod.ts";
import {
  Application,
  Router,
  send,
} from "https://deno.land/x/oak@v9.0.0/mod.ts";

import { render } from "./render.ts";
import { transform } from "./helpers/transform.ts";
import { ImportMap, StartOptions } from "./types.ts";

import "./shims/shim.js?global";

const root = (globalThis as any)[Symbol.for("dom-shim.defaultView")] as any;

Object.assign(window, root);

const app = new Application();
const router = new Router();
const serverStart = +new Date();
const isDev = Deno.env.get("mode") === "dev";

const start = ({
  importmap: importMapSource,
  folder,
  port: serverPort,
}: StartOptions) => {
  const memory = new LRU<string>(500);

  const importmap: ImportMap = JSON.parse(importMapSource);
  const appFolder = folder || "app";
  const port = serverPort || parseInt(Deno.env.get("port") || "", 10) || 3000;
  const root = Deno.env.get("url") || `http://localhost:${port}`;

  app.use(async (context, next) => {
    const { pathname } = context.request.url;
    if (pathname == "/") {
      await next();
    }
    try {
      await send(context, pathname, {
        root: join(Deno.cwd(), appFolder),
      });
    } catch (_e) {
      await next();
    }
  });

  router.get("/:slug+.js", async (context, next) => {
    const { pathname } = context.request.url;
    if (memory.has(pathname) && !isDev) {
      context.response.type = "application/javascript";
      context.response.body = memory.get(pathname);
      return;
    }
    const js = pathname.replaceAll(".js", ".js");
    const ts = pathname.replaceAll(".js", ".ts");
    const file = existsSync(join(Deno.cwd(), appFolder, js))
      ? js
      : existsSync(join(Deno.cwd(), appFolder, ts))
      ? ts
      : false;
    if (!file) {
      return await next();
    }
    try {
      const source = await Deno.readTextFile(
        join(Deno.cwd(), appFolder, ...file.split("/"))
      );

      const code = await transform({
        source,
        importmap,
        root,
        timestamp: serverStart,
        minify: !isDev,
      });
      if (!isDev) {
        memory.set(pathname, code);
      }
      context.response.type = "application/javascript";
      context.response.body = code;
    } catch (e) {
      console.log(e);
    }
  });

  router.get("/(.*)", async (context) => {
    try {
      const timestamp = isDev ? +new Date() : serverStart;
      const headers = new Headers();
      headers.set('Content-Type', 'text/html; charset=UTF-8')
      context.response.headers = headers;
      context.response.body = await render({
        root,
        context,
        importmap,
        timestamp
      });
    } catch (e) {
      console.log(e);
      context.throw(500);
    }
  });

  app.use(router.routes());

  app.use(router.allowedMethods());

  app.addEventListener("listen", () => {
    console.log(`Listening: ${root}`);
  });

  app.addEventListener("error", (evt) => {
    console.log(evt.error);
  });

  app.listen({ port });
};

export default start;

export { app, router };

export * from "./types.ts";