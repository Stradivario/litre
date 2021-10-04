import litre from '../src/mod.ts';

litre({
  importmap: await Deno.readTextFile('importmap.json'),
  folder: 'app',
  port: 4200,
});
