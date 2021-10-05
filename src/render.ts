import { Buffer } from 'https://deno.land/std@0.107.0/io/mod.ts';
import { join } from 'https://deno.land/std@0.107.0/path/mod.ts';

import {
  defaultBufferSize,
  defaultChunkSize,
  RenderConfigLitre,
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

  const app = (await import(join(root, `app.js?ts=${timestamp}`))) as {
    default: RenderConfigLitre;
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
