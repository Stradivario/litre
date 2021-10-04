/// <reference lib="dom" />
// deno-lint-ignore-file no-explicit-any
import {
  RouteParams,
  RouterContext,
} from "https://deno.land/x/oak@v9.0.0/mod.ts";

export type ImportMap = { imports: Record<string, unknown> };

export type Navigate = (to: string, opts?: { replace?: boolean }) => void;

export type StartOptions = {
  importmap: string;
  lang?: string;
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

export interface RenderConfigLitre {
  page: (options: {
    context: RouterContext<RouteParams, Record<string, any>>;
    html(
      strings: TemplateStringsArray,
      ...values: unknown[]
    ): AsyncIterator<string, void, undefined>;
  }) => AsyncIterable<string> & AsyncIterator<string, void, undefined>;
}

export const defaultBufferSize = 8 * 1024;
export const defaultChunkSize = 8 * 1024;


/* If we declare global variables and we need them typed this is the way */
// declare global {
//   var html: (
//     strings: TemplateStringsArray,
//     ...values: unknown[]
//   ) => AsyncIterator<string, void, undefined>;
//   interface Window {
//     html: (
//       strings: TemplateStringsArray,
//       ...values: unknown[]
//     ) => AsyncIterator<string, void, undefined>;
//   }
// }