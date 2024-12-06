import type { Plugin } from 'rollup';

import url from 'node:url';
import path from 'node:path';
import * as fsPromise from 'node:fs/promises';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { rimraf } from 'rimraf';

const getDirname = (importMetaUrl: string) => {
  const __filename = url.fileURLToPath(importMetaUrl);
  const __dirname = path.dirname(__filename);
  return __dirname;
};

const __dirname = getDirname(import.meta.url);

const resolveToAbsolutePath = (p = '') => path.resolve(__dirname, p);

const distPath = resolveToAbsolutePath('dist');

const getJson = async <T extends object>(p: string) => {
  const jsonString = await fsPromise.readFile(p, {
    encoding: 'utf8',
  });
  return JSON.parse(jsonString) as T;
};

const excludeDependenciesFromBundle: (options: { packageJsonDir: string }) => Plugin = ({ packageJsonDir }) => {
  return {
    name: 'exclude-dependencies-from-bundle',
    options: async (options) => {
      const { external = [] } = options;

      if (!Array.isArray(external)) {
        throw new Error('[exclude-dependencies-from-bundle] rollupConfig.external must be array! ');
      }

      const packageJson = await getJson<{
        peerDependencies?: Record<string, string>;
        dependencies?: Record<string, string>;
      }>(path.join(packageJsonDir || process.cwd(), './package.json'));

      const dependencies = [
        ...new Set([
          ...Object.keys(packageJson.peerDependencies ?? {}),
          ...Object.keys(packageJson.dependencies ?? {}),
        ]),
      ]
        .filter((dependency) => dependency)
        .map((dependency) => new RegExp(`^${dependency}(\\/.+)*$`));

      return {
        ...options,
        external: [...external, ...dependencies],
      };
    },
  };
};

await rimraf(distPath);

const config = {
  input: resolveToAbsolutePath('src/index.ts'),
  output: {
    dir: distPath,
    format: 'es',
    compact: true,
    preserveModules: true,
    plugins: [terser()],
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({
      compilerOptions: {
        outDir: distPath,
      },
      include: [resolveToAbsolutePath('src/**/*')],
      tsconfig: './tsconfig.json',
    }),

    excludeDependenciesFromBundle({ packageJsonDir: resolveToAbsolutePath() }),
  ],
  strictDeprecations: true,
};

export default config;
