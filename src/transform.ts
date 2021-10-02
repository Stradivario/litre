import * as esbuild from 'https://deno.land/x/esbuild@v0.12.24/mod.js';
import {
  CallExpression,
  HasSpan
} from 'https://deno.land/x/swc@0.1.4/types/options.ts';
import { parse } from 'https://x.nest.land/swc@0.1.4/mod.ts';

import { TransformOptions } from './types.ts';

const isDev = Deno.env.get('mode') === 'dev';
const serverStart = +new Date();

let offset = 0;
let length = 0;

const transform = async ({ source, importmap, root }: TransformOptions) => {
  const t0 = performance.now();
  const { code } = await esbuild.transform(source, {
    loader: 'ts',
    target: ['esnext'],
    minify: !isDev
  });

  let c = '';
  const ast = parse(code, {
    syntax: 'typescript',
    target: 'es2021',
    dynamicImport: true
  });
  ast.body.forEach(i => {
    if (i.type == 'ImportDeclaration') {
      const { value, span } = i.source;
      c += code.substring(offset - length, span.start - length);
      c += `"${importmap?.imports?.[value] ||
        value.replace(
          /.js|.ts/gi,
          () => `.js?ts=${isDev ? +new Date() : serverStart}`
        )}"`;
      offset = span.end;
    }
    if (i.type == 'VariableDeclaration') {
      i.declarations?.forEach(o => {
        return (o.init as CallExpression)?.arguments?.forEach(
          ({ expression }) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore deno_swc doesn't have generics
            const expressionBody = expression.body;

            if (expressionBody?.callee?.value?.toLowerCase() === 'import') {
              expressionBody?.arguments?.forEach(
                (b: {
                  expression: {
                    value: string;
                  } & HasSpan;
                }) => {
                  const { value, span } = b?.expression;
                  c += code.substring(offset - length, span.start - length);
                  c += `"${value.replace(
                    /.js|.ts/gi,
                    () => `.js?ts=${isDev ? +new Date() : serverStart}`
                  )}"`;
                  offset = span.end;
                }
              );
            }
          }
        );
      });
    }
  });
  c += code.substring(offset - length, code.length + offset);
  length += code.length + 1;
  offset = length;
  const t1 = performance.now();
  console.log(`Transpile: in ${t1 - t0}ms`);
  c = c.replaceAll('ULTRA_URL', root);
  esbuild.stop();
  return c;
};

export default transform;
