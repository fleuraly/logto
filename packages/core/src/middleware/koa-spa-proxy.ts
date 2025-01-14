import fs from 'fs/promises';
import path from 'path';

import { MiddlewareType } from 'koa';
import proxy from 'koa-proxies';
import { IRouterParamContext } from 'koa-router';
import serveStatic from 'koa-static';

import envSet, { MountedApps } from '@/env-set';
import { fromRoot } from '@/env-set/parameters';

export default function koaSpaProxy<StateT, ContextT extends IRouterParamContext, ResponseBodyT>(
  packagePath = 'ui',
  port = 5001,
  prefix = ''
): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  type Middleware = MiddlewareType<StateT, ContextT, ResponseBodyT>;

  const packagesPath = fromRoot ? 'packages/' : '..';
  const distPath = path.join(packagesPath, packagePath, 'dist');

  const spaProxy: Middleware = envSet.values.isProduction
    ? serveStatic(distPath)
    : proxy('*', {
        target: `http://localhost:${port}`,
        changeOrigin: true,
        logs: true,
        rewrite: (requestPath) => {
          // Static files
          if (requestPath.includes('.')) {
            return '/' + path.join(prefix, requestPath);
          }

          // In-app routes
          return requestPath;
        },
      });

  return async (ctx, next) => {
    const requestPath = ctx.request.path;

    // Route has been handled by one of mounted apps
    if (
      !prefix &&
      Object.values(MountedApps).some((app) => app !== prefix && requestPath.startsWith(`/${app}`))
    ) {
      return next();
    }

    if (!envSet.values.isProduction) {
      return spaProxy(ctx, next);
    }

    const spaDistFiles = await fs.readdir(distPath);

    if (!spaDistFiles.some((file) => requestPath.startsWith('/' + file))) {
      ctx.request.path = '/';
    }

    return spaProxy(ctx, next);
  };
}
