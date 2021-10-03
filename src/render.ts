// deno-lint-ignore-file no-explicit-any
/// <reference lib="dom" />

import { concat } from "https://deno.land/std@0.107.0/bytes/mod.ts";
import { Buffer } from "https://deno.land/std@0.107.0/io/mod.ts";
import { join } from "https://deno.land/std@0.107.0/path/mod.ts";

import { Ocean } from "https://cdn.spooky.click/ocean/1.3.0/ocean.js";
import { RenderOptions } from "./types.ts";

const isDev = Deno.env.get("mode") === "dev";
const serverStart = +new Date();

const defaultBufferSize = 8 * 1024;
const defaultChunkSize = 8 * 1024;


const encodeStream = (readable: ReadableStream) =>
  new ReadableStream({
    start(controller) {
      return (async () => {
        const encoder = new TextEncoder();
        const reader = readable.getReader();
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            if (typeof value === "string") {
              controller.enqueue(encoder.encode(value));
            } else if (value instanceof Uint8Array) {
              controller.enqueue(value);
            } else {
              throw new TypeError();
            }
          }
        } finally {
          controller.close();
        }
      })();
    },
  });

async function pushBody(
  reader: ReadableStreamDefaultReader,
  controller: ReadableStreamDefaultController,
  chunkSize: number
) {
  let parts = [];
  let partsSize = 0;

  while (true) {
    const read = await reader.read();
    if (read.done) break;
    partsSize += read.value.length;
    parts.push(read.value);
    if (partsSize >= chunkSize) {
      const write = concat(...parts);
      parts = [];
      partsSize = 0;
      if (write.length > chunkSize) {
        parts.push(write.slice(chunkSize));
      }
      controller.enqueue(write.slice(0, chunkSize));
    }
  }
  controller.enqueue(concat(...parts));
}

export default async (
  {
    root,
    lang,
    title,
    bufferSize,
    chunkSize,
    headScripts,
    tailScripts,
  }: RenderOptions = {} as RenderOptions
) => {
  chunkSize = chunkSize ?? defaultChunkSize;

  const ts = isDev ? +new Date() : serverStart;

  const app = await import(join(root, `app.js?ts=${ts}`));

  const { html } = new (Ocean as any)({
    document,
  });
  
  const body = new ReadableStream({
    start(controller) {
      (async () => {
        if (!customElements.get('app-root')) {
          customElements.define('app-root', app.default);
        }
        const webPageIterator = html`
          <!DOCTYPE html>
          <html lang="${lang}">
            <head>
              <title>${title ?? 'My app'}</title>
              <script type="module" defer>
                ${headScripts?.join(" ") || ""}
              </script>
            </head>
            <body>
              <app-root></app-root>
            </body>
            <script type="module" defer>
              ${tailScripts?.join(" ") || ""}
            </script>
          </html>
        `;
        for await (const chunk of webPageIterator) {
          controller.enqueue(chunk);
        }
        controller.close();
      })();
    },
  });

  const encodedStream = encodeStream(body);
  const bodyReader = encodedStream.getReader();
  const buffer = new Buffer();

  while (buffer.length < (bufferSize ?? defaultBufferSize)) {
    const read = await bodyReader.read();
    if (read.done) {
      break;
    }
    await buffer.write(read.value);
  }

  return encodeStream(
    new ReadableStream({
      start(
        controller,
        push = (part: unknown) => Promise.resolve(controller.enqueue(part))
      ) {
        (async () => {
          try {
            await push(buffer.bytes({ copy: false }));
            await pushBody(bodyReader, controller, chunkSize as never);
          } catch (e) {
            console.error("readable stream error", e);
            await push("Error");
          }
          controller.close();
        })();
      },
    })
  );
};
