import litre from './src/main.ts';

litre({
  importmap: await Deno.readTextFile('importmap.json'),
  folder: 'app',
  port: 4200
});
