/// <reference lib="dom" />
// deno-lint-ignore-file no-explicit-any
// deno-lint-ignore no-unused-vars
import { Ocean } from 'https://cdn.spooky.click/ocean/1.3.0/ocean.js';
import {
  RouteParams,
  RouterContext,
} from 'https://deno.land/x/oak@v9.0.0/mod.ts';

export type ImportMap = { imports: Record<string, unknown> };

export type Navigate = (to: string, opts?: { replace?: boolean }) => void;

export type StartOptions = {
  importmap?: string;
  folder?: string;
  port?: number;
};

export type TransformOptions = {
  source: string;
  importmap: ImportMap;
  root: string;
  minify: boolean;
  timestamp: number;
  offset?: number;
  length?: number;
};

export type RenderOptions = {
  root: string;
  importmap: ImportMap;
  context: RouterContext<RouteParams, Record<string, any>>;
  // Number of bytes of the response to buffer before starting to stream. This
  // allows 500 statuses to be raised, provided the error happens while the
  // response is buffering, rather than streaming:
  bufferSize?: number;

  // Size of the chunk to emit to the connection as the response streams:
  chunkSize?: number;
  timestamp?: number;
};

export type Cache = Map<unknown, unknown>;

export interface Litre {
  /**
   * The main page that will be rendered
   * accepts as a return type AsyncIterable
   * it is intended to be used with `Ocean.html`
   * ```
   *  export default Litre({
   *    page: () => Ocean.html`
   *      <!DOCTYPE html>
   *      <html lang="en">
   *        <head>
   *          <meta charset="UTF-8">
   *          <title>My app</title>
   *        </head>
   *        <body>
   *          <app-root></app-root>
   *        </body>
   *      </html>
   *    `,
   *  });
   *```
   */
  page: (options: {
    context: RouterContext<RouteParams, Record<string, any>>;
  }) => AsyncIterable<string>;
}

self.Litre = (c) => c;

export const defaultBufferSize = 8 * 1024;
export const defaultChunkSize = 8 * 1024;

/* If we declare global variables and we need them typed this is the way */
declare global {
  /** 
   * Rendering library for SSR called Ocean
   * https://github.com/matthewp/ocean
   * */ 
  var Ocean: {
    /**
     * Renders string literal as a AsyncIterable
     * can be used like so 
     * ```
     * Ocean.html`
     *   <!DOCTYPE html>
     *   <html lang="en">
     *     <head>
     *       <meta charset="UTF-8">
     *       <title>My app</title>
     *     </head>
     *     <body>
     *       <app-root></app-root>
     *     </body>
     *   </html>
     * `
     * ```
     */
    html: (
      strings: TemplateStringsArray,
      ...values: unknown[]
    ) => AsyncIterable<string>;
  } & Ocean;
  /**
 * Overload to type config in context,
 * later on we can apply validation
 * ```
 * export default Litre({
 *   page: () => Ocean.html`
 *     <!DOCTYPE html>
 *     <html lang="en">
 *       <head>
 *         <meta charset="UTF-8">
 *         <title>My app</title>
 *       </head>
 *       <body>
 *         <app-root></app-root>
 *       </body>
 *     </html>
 *   `,
 * });
 * ```
 * */
  function Litre(c: Litre): Litre;
  interface Window {
    Ocean: {
      html: (
        strings: TemplateStringsArray,
        ...values: unknown[]
      ) => AsyncIterable<string>;
    } & Ocean;
    Litre: (c: Litre) => Litre;
  }
}
