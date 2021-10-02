import { concat } from "https://deno.land/std@0.107.0/bytes/mod.ts";
import { Buffer } from "https://deno.land/std@0.107.0/io/mod.ts";
import { join } from "https://deno.land/std@0.107.0/path/mod.ts";

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
    bufferSize,
    chunkSize,
    headScripts,
    tailScripts,
  }: RenderOptions = {} as RenderOptions
) => {
  chunkSize = chunkSize ?? defaultChunkSize;

  const ts = isDev ? +new Date() : serverStart;
  const app = await import(join(root, `app.js?ts=${ts}`));

  const body = new ReadableStream({
    start(controller) {
      (async () => {
        controller.enqueue(await app.default());
        controller.close();
      })();
    },
  });

  const head = () => `
  <!DOCTYPE html><html lang="${lang}"><head>
  <script type="module" defer>
    ${headScripts?.join(" ") || ""}
  </script>
  </head><body>
  `;

  const tail = () => `</body>
  <script type="module" defer>
    ${tailScripts?.join(" ") || ""}
  </script>
  </html>`;

  const encodedStream = encodeStream(body);
  const bodyReader = encodedStream.getReader();
  const buffer = new Buffer();

  while (buffer.length < (bufferSize ?? defaultBufferSize)) {
    const read = await bodyReader.read();
    if (read.done) {
      break;
    }
    buffer.writeSync(read.value);
  }

  return encodeStream(
    new ReadableStream({
      start(
        controller,
        push = (part: unknown) => Promise.resolve(controller.enqueue(part))
      ) {
        (async () => {
          try {
            await push(head());
            await push(buffer.bytes({ copy: false }));
            await pushBody(bodyReader, controller, chunkSize as never);
            await push(tail());
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
