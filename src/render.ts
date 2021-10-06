// deno-lint-ignore-file no-explicit-any
import { Buffer } from 'https://deno.land/std@0.107.0/io/mod.ts';
import { join } from 'https://deno.land/std@0.107.0/path/mod.ts';
import { parseHTML } from 'https://unpkg.com/linkedom@0.11.0/worker.js';
import { Ocean } from 'https://cdn.spooky.click/ocean/1.3.0/ocean.js';

import {
  defaultBufferSize,
  defaultChunkSize,
  Litre,
  RenderOptions,
} from './types.ts';
import { pushBody } from './helpers/push-body.ts';
import { encodeStream } from './helpers/encode-stream.ts';

export const render = async (
  {
    root,
    bufferSize,
    chunkSize,
    context,
    timestamp,
  }: RenderOptions = {} as RenderOptions
) => {
  chunkSize = chunkSize ?? defaultChunkSize;

  const parsed = parseHTML(`<html></html>`);
  (self as any).document = parsed?.document;
  (self as any).customElements = parsed?.customElements;
  (self as any).HTMLElement = parsed?.HTMLElement;

  const ocean = new Ocean({
    document,
    hydration: 'full',
    polyfillURL: '',
    hydrators: [],
  });
  
  /* Lets use ocean globally for SSR Templates */
  self.Ocean = ocean as never;
  
  const app = (await import(join(root, `app.js?ts=${timestamp}`))) as {
    default: Litre;
  };
  const body = new ReadableStream({
    start(controller) {
      (async () => {
        const webPageIterator = app.default.page({
          context,
        });
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
            console.error('readable stream error', e);
            await push('Error');
          }
          controller.close();
        })();
      },
    })
  );
};
