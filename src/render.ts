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

interface CustomElementLitre extends CustomElementConstructor {
  is(): string;
}

interface RenderConfigLitre {
  root: CustomElementLitre;
  page: AsyncIterable<string>;
}

declare global {
  var html: (strings: TemplateStringsArray, ...values: unknown[]) => AsyncIterator<string, void, undefined>;
  interface Window { html: (strings: TemplateStringsArray, ...values: unknown[]) => AsyncIterator<string, void, undefined>; }
}

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
  { root, bufferSize, chunkSize }: RenderOptions = {} as RenderOptions
) => {
  chunkSize = chunkSize ?? defaultChunkSize;

  const ts = isDev ? +new Date() : serverStart;

  
  const ocean = new Ocean({
    document,
  } as any);

  self.html = ocean.html as any;

  const app = (await import(join(root, `app.js?ts=${ts}`))) as {
    default: RenderConfigLitre;
  };


  const body = new ReadableStream({
    start(controller) {
      (async () => {
     
        if (!customElements.get(app.default.root.is())) {
          customElements.define(app.default.root.is(), app.default.root);
        }
        const webPageIterator = app.default.page;
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
