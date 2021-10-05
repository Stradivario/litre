import { start } from 'https://raw.githubusercontent.com/Stradivario/litre/master/src/mod.ts';

start({
  importmap: await Deno.readTextFile('importmap.json'),
  folder: 'app',
  port: 4200,
});
