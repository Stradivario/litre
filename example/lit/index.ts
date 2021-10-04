import litre from 'https://raw.githubusercontent.com/Stradivario/litre/master/src/mod.ts';

litre({
  importmap: await Deno.readTextFile('importmap.json'),
  folder: 'app',
  port: 4200,
});
