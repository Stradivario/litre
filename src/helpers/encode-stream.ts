export const encodeStream = (readable: ReadableStream) =>
  new ReadableStream<Uint8Array>({
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
