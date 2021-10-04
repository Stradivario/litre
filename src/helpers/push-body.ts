import { concat } from "https://deno.land/std@0.107.0/bytes/mod.ts";

export async function pushBody(
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
