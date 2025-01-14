/* eslint-disable max-lines */
/* eslint-disable unicorn/prevent-abbreviations */
// Modified from `@types/koa-router`
// Added more precise middleware chain typings

declare module 'koa-router' {
  // Type definitions for koa-router 7.4
  // Project: https://github.com/alexmingoia/koa-router#readme
  // Definitions by: Jerry Chin <https://github.com/hellopao>
  //                 Pavel Ivanov <https://github.com/schfkt>
  //                 JounQin <https://github.com/JounQin>
  //                 Romain Faust <https://github.com/romain-faust>
  //                 Guillaume Mayer <https://github.com/Guillaume-Mayer>
  //                 Andrea Gueugnaut <https://github.com/falinor>
  //                 Yves Kaufmann <https://github.com/yveskaufmann>
  // Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
  // TypeScript Version: 2.3

  /* =================== USAGE ===================
  
      import * as Router from "koa-router";
      var router = new Router();
  
   =============================================== */

  import * as Koa from 'koa';

  declare namespace Router {
    export interface IRouterOptions {
      /**
       * Prefix for all routes.
       */
      prefix?: string | undefined;
      /**
       * Methods which should be supported by the router.
       */
      methods?: string[] | undefined;
      routerPath?: string | undefined;
      /**
       * Whether or not routing should be case-sensitive.
       */
      sensitive?: boolean | undefined;
      /**
       * Whether or not routes should matched strictly.
       *
       * If strict matching is enabled, the trailing slash is taken into
       * account when matching routes.
       */
      strict?: boolean | undefined;
    }

    export interface IRouterParamContext<StateT = any, CustomT = Record<string, unknown>> {
      /**
       * Url params
       */
      params: Record<string, string>;
      /**
       * The router instance
       */
      router: Router<StateT, CustomT>;
      /**
       * Matched route
       */
      _matchedRoute: string | RegExp | undefined;
      _matchedRouteName: string | undefined;
    }

    export type RouterContext<
      StateT = any,
      CustomT = Record<string, unknown>
    > = Koa.ParameterizedContext<StateT, CustomT & IRouterParamContext<StateT, CustomT>>;

    // For backward compatibility IRouterContext needs to be an interface
    // But it's deprecated - please use `RouterContext` instead
    export interface IRouterContext extends RouterContext {}

    export type IMiddleware<StateT = any, CustomT = Record<string, unknown>> = Koa.Middleware<
      StateT,
      CustomT & IRouterParamContext<StateT, CustomT>
    >;

    export type IParamMiddleware<STateT = any, CustomT = Record<string, unknown>> = (
      param: string,
      ctx: RouterContext<STateT, CustomT>,
      next: () => Promise<any>
    ) => any;

    export interface IRouterAllowedMethodsOptions {
      /**
       * Throw error instead of setting status and header
       */
      throw?: boolean | undefined;
      /**
       * Throw the returned value in place of the default NotImplemented error
       */
      notImplemented?: (() => any) | undefined;
      /**
       * Throw the returned value in place of the default MethodNotAllowed error
       */
      methodNotAllowed?: (() => any) | undefined;
    }

    export interface ILayerOptions {
      name: string;
      sensitive?: boolean | undefined;
      strict?: boolean | undefined;
      end?: boolean | undefined;
      prefix?: string | undefined;
      ignoreCaptures?: boolean | undefined;
    }

    export interface IUrlOptionsQuery {
      query: Record<string, unknown> | string;
    }

    export interface IRoutesMatch {
      path: Layer[];
      pathAndMethod: Layer[];
      route: boolean;
    }

    export class ParamName {
      asterisk: boolean;
      delimiter: string;
      name: string;
      optional: boolean;
      partial: boolean;
      pattern: string;
      prefix: string;
      repeat: string;
    }

    export class Layer {
      opts: ILayerOptions;
      name: string;
      methods: string[];
      paramNames: ParamName[];
      stack: IMiddleware[];
      regexp: RegExp;
      path: string;

      constructor(
        path: string | RegExp,
        methods: string[],
        middleware: IMiddleware | IMiddleware[],
        opts?: ILayerOptions
      );

      /**
       * Returns whether request `path` matches route.
       */
      match(path: string): boolean;

      /**
       * Returns map of URL parameters for given `path` and `paramNames`.
       */
      params(
        path: string | RegExp,
        captures: string[],
        existingParams?: Record<string, unknown>
      ): Record<string, unknown>;

      /**
       * Returns array of regexp url path captures.
       */
      captures(path: string): string[];

      /**
       * Generate URL for route using given `params`.
       */
      url(params: Record<string, unknown>): string;

      /**
       * Run validations on route named parameters.
       */
      param(param: string, fn: IMiddleware): Layer;

      /**
       * Prefix route path.
       */
      setPrefix(prefix: string): Layer;
    }
  }

  declare class Router<StateT = any, CustomT = Record<string, unknown>> {
    params: Record<string, unknown>;
    stack: Router.Layer[];

    /**
     * Create a new router.
     */
    constructor(opt?: Router.IRouterOptions);

    /**
     * Use given middleware.
     *
     * Middleware run in the order they are defined by `.use()`. They are invoked
     * sequentially, requests start at the first middleware and work their way
     * "down" the middleware stack.
     */
    use(...middleware: Array<Router.IMiddleware<StateT, CustomT>>): Router<StateT, CustomT>;
    use(
      path: string | string[] | RegExp,
      ...middleware: Array<Router.IMiddleware<StateT, CustomT>>
    ): Router<StateT, CustomT>;

    /**
     * HTTP get method
     */
    get(
      name: string,
      path: string | RegExp,
      ...middleware: Array<Router.IMiddleware<StateT, CustomT>>
    ): Router<StateT, CustomT>;
    get(
      path: string | RegExp | Array<string | RegExp>,
      ...middleware: Array<Router.IMiddleware<StateT, CustomT>>
    ): Router<StateT, CustomT>;
    get<T, U>(
      name: string,
      path: string | RegExp,
      middleware: Koa.Middleware<T, U>,
      routeHandler: Router.IMiddleware<StateT & T, CustomT & U>
    ): Router<StateT & T, CustomT & U>;
    get<T, U>(
      path: string | RegExp | Array<string | RegExp>,
      middleware: Koa.Middleware<T, U>,
      routeHandler: Router.IMiddleware<StateT & T, CustomT & U>
    ): Router<StateT & T, CustomT & U>;

    // Additional signatures
    get<T1, U1, T2, U2>(
      path: string | RegExp | Array<string | RegExp>,
      middleware1: Koa.Middleware<T1, U1>,
      middleware2: Koa.Middleware<StateT & T1, CustomT & U1>,
      routeHandler: Router.IMiddleware<StateT & T1 & T2, CustomT & U1 & U2>
    ): Router<StateT & T1 & T2, CustomT & U1 & U2>;
    get<T1, U1, T2, U2, T3, U3>(
      path: string | RegExp | Array<string | RegExp>,
      middleware1: Koa.Middleware<T1, U1>,
      middleware2: Koa.Middleware<StateT & T1, CustomT & U1>,
      middleware3: Koa.Middleware<StateT & T1 & T2, CustomT & U1 & U2>,
      routeHandler: Router.IMiddleware<StateT & T1 & T2 & T3, CustomT & U1 & U2 & U3>
    ): Router<StateT & T1 & T2 & T3, CustomT & U1 & U2 & U3>;

    /**
     * HTTP post method
     */
    post(
      name: string,
      path: string | RegExp,
      ...middleware: Array<Router.IMiddleware<StateT, CustomT>>
    ): Router<StateT, CustomT>;
    post(
      path: string | RegExp | Array<string | RegExp>,
      ...middleware: Array<Router.IMiddleware<StateT, CustomT>>
    ): Router<StateT, CustomT>;
    post<T, U>(
      name: string,
      path: string | RegExp,
      middleware: Koa.Middleware<T, U>,
      routeHandler: Router.IMiddleware<StateT & T, CustomT & U>
    ): Router<StateT & T, CustomT & U>;
    post<T, U>(
      path: string | RegExp | Array<string | RegExp>,
      middleware: Koa.Middleware<T, U>,
      routeHandler: Router.IMiddleware<StateT & T, CustomT & U>
    ): Router<StateT & T, CustomT & U>;

    // Additional signatures
    post<T1, U1, T2, U2>(
      path: string | RegExp | Array<string | RegExp>,
      middleware1: Koa.Middleware<T1, U1>,
      middleware2: Koa.Middleware<StateT & T1, CustomT & U1>,
      routeHandler: Router.IMiddleware<StateT & T1 & T2, CustomT & U1 & U2>
    ): Router<StateT & T1 & T2, CustomT & U1 & U2>;
    post<T1, U1, T2, U2, T3, U3>(
      path: string | RegExp | Array<string | RegExp>,
      middleware1: Koa.Middleware<T1, U1>,
      middleware2: Koa.Middleware<StateT & T1, CustomT & U1>,
      middleware3: Koa.Middleware<StateT & T1 & T2, CustomT & U1 & U2>,
      routeHandler: Router.IMiddleware<StateT & T1 & T2 & T3, CustomT & U1 & U2 & U3>
    ): Router<StateT & T1 & T2 & T3, CustomT & U1 & U2 & U3>;

    /**
     * HTTP put method
     */
    put(
      name: string,
      path: string | RegExp,
      ...middleware: Array<Router.IMiddleware<StateT, CustomT>>
    ): Router<StateT, CustomT>;
    put(
      path: string | RegExp | Array<string | RegExp>,
      ...middleware: Array<Router.IMiddleware<StateT, CustomT>>
    ): Router<StateT, CustomT>;
    put<T, U>(
      name: string,
      path: string | RegExp,
      middleware: Koa.Middleware<T, U>,
      routeHandler: Router.IMiddleware<StateT & T, CustomT & U>
    ): Router<StateT & T, CustomT & U>;
    put<T, U>(
      path: string | RegExp | Array<string | RegExp>,
      middleware: Koa.Middleware<T, U>,
      routeHandler: Router.IMiddleware<StateT & T, CustomT & U>
    ): Router<StateT & T, CustomT & U>;

    // Additional signatures
    put<T1, U1, T2, U2>(
      path: string | RegExp | Array<string | RegExp>,
      middleware1: Koa.Middleware<T1, U1>,
      middleware2: Koa.Middleware<StateT & T1, CustomT & U1>,
      routeHandler: Router.IMiddleware<StateT & T1 & T2, CustomT & U1 & U2>
    ): Router<StateT & T1 & T2, CustomT & U1 & U2>;
    put<T1, U1, T2, U2, T3, U3>(
      path: string | RegExp | Array<string | RegExp>,
      middleware1: Koa.Middleware<T1, U1>,
      middleware2: Koa.Middleware<StateT & T1, CustomT & U1>,
      middleware3: Koa.Middleware<StateT & T1 & T2, CustomT & U1 & U2>,
      routeHandler: Router.IMiddleware<StateT & T1 & T2 & T3, CustomT & U1 & U2 & U3>
    ): Router<StateT & T1 & T2 & T3, CustomT & U1 & U2 & U3>;

    /**
     * HTTP link method
     */
    link(
      name: string,
      path: string | RegExp,
      ...middleware: Array<Router.IMiddleware<StateT, CustomT>>
    ): Router<StateT, CustomT>;
    link(
      path: string | RegExp | Array<string | RegExp>,
      ...middleware: Array<Router.IMiddleware<StateT, CustomT>>
    ): Router<StateT, CustomT>;
    link<T, U>(
      name: string,
      path: string | RegExp,
      middleware: Koa.Middleware<T, U>,
      routeHandler: Router.IMiddleware<StateT & T, CustomT & U>
    ): Router<StateT & T, CustomT & U>;
    link<T, U>(
      path: string | RegExp | Array<string | RegExp>,
      middleware: Koa.Middleware<T, U>,
      routeHandler: Router.IMiddleware<StateT & T, CustomT & U>
    ): Router<StateT & T, CustomT & U>;

    // Additional signatures
    link<T1, U1, T2, U2>(
      path: string | RegExp | Array<string | RegExp>,
      middleware1: Koa.Middleware<T1, U1>,
      middleware2: Koa.Middleware<StateT & T1, CustomT & U1>,
      routeHandler: Router.IMiddleware<StateT & T1 & T2, CustomT & U1 & U2>
    ): Router<StateT & T1 & T2, CustomT & U1 & U2>;
    link<T1, U1, T2, U2, T3, U3>(
      path: string | RegExp | Array<string | RegExp>,
      middleware1: Koa.Middleware<T1, U1>,
      middleware2: Koa.Middleware<StateT & T1, CustomT & U1>,
      middleware3: Koa.Middleware<StateT & T1 & T2, CustomT & U1 & U2>,
      routeHandler: Router.IMiddleware<StateT & T1 & T2 & T3, CustomT & U1 & U2 & U3>
    ): Router<StateT & T1 & T2 & T3, CustomT & U1 & U2 & U3>;

    /**
     * HTTP unlink method
     */
    unlink(
      name: string,
      path: string | RegExp,
      ...middleware: Array<Router.IMiddleware<StateT, CustomT>>
    ): Router<StateT, CustomT>;
    unlink(
      path: string | RegExp | Array<string | RegExp>,
      ...middleware: Array<Router.IMiddleware<StateT, CustomT>>
    ): Router<StateT, CustomT>;
    unlink<T, U>(
      name: string,
      path: string | RegExp,
      middleware: Koa.Middleware<T, U>,
      routeHandler: Router.IMiddleware<StateT & T, CustomT & U>
    ): Router<StateT & T, CustomT & U>;
    unlink<T, U>(
      path: string | RegExp | Array<string | RegExp>,
      middleware: Koa.Middleware<T, U>,
      routeHandler: Router.IMiddleware<StateT & T, CustomT & U>
    ): Router<StateT & T, CustomT & U>;

    // Additional signatures
    unlink<T1, U1, T2, U2>(
      path: string | RegExp | Array<string | RegExp>,
      middleware1: Koa.Middleware<T1, U1>,
      middleware2: Koa.Middleware<StateT & T1, CustomT & U1>,
      routeHandler: Router.IMiddleware<StateT & T1 & T2, CustomT & U1 & U2>
    ): Router<StateT & T1 & T2, CustomT & U1 & U2>;
    unlink<T1, U1, T2, U2, T3, U3>(
      path: string | RegExp | Array<string | RegExp>,
      middleware1: Koa.Middleware<T1, U1>,
      middleware2: Koa.Middleware<StateT & T1, CustomT & U1>,
      middleware3: Koa.Middleware<StateT & T1 & T2, CustomT & U1 & U2>,
      routeHandler: Router.IMiddleware<StateT & T1 & T2 & T3, CustomT & U1 & U2 & U3>
    ): Router<StateT & T1 & T2 & T3, CustomT & U1 & U2 & U3>;

    /**
     * HTTP delete method
     */
    delete(
      name: string,
      path: string | RegExp,
      ...middleware: Array<Router.IMiddleware<StateT, CustomT>>
    ): Router<StateT, CustomT>;
    delete(
      path: string | RegExp | Array<string | RegExp>,
      ...middleware: Array<Router.IMiddleware<StateT, CustomT>>
    ): Router<StateT, CustomT>;
    delete<T, U>(
      name: string,
      path: string | RegExp,
      middleware: Koa.Middleware<T, U>,
      routeHandler: Router.IMiddleware<StateT & T, CustomT & U>
    ): Router<StateT & T, CustomT & U>;
    delete<T, U>(
      path: string | RegExp | Array<string | RegExp>,
      middleware: Koa.Middleware<T, U>,
      routeHandler: Router.IMiddleware<StateT & T, CustomT & U>
    ): Router<StateT & T, CustomT & U>;

    // Additional signatures
    delete<T1, U1, T2, U2>(
      path: string | RegExp | Array<string | RegExp>,
      middleware1: Koa.Middleware<T1, U1>,
      middleware2: Koa.Middleware<StateT & T1, CustomT & U1>,
      routeHandler: Router.IMiddleware<StateT & T1 & T2, CustomT & U1 & U2>
    ): Router<StateT & T1 & T2, CustomT & U1 & U2>;
    delete<T1, U1, T2, U2, T3, U3>(
      path: string | RegExp | Array<string | RegExp>,
      middleware1: Koa.Middleware<T1, U1>,
      middleware2: Koa.Middleware<StateT & T1, CustomT & U1>,
      middleware3: Koa.Middleware<StateT & T1 & T2, CustomT & U1 & U2>,
      routeHandler: Router.IMiddleware<StateT & T1 & T2 & T3, CustomT & U1 & U2 & U3>
    ): Router<StateT & T1 & T2 & T3, CustomT & U1 & U2 & U3>;

    /**
     * Alias for `router.delete()` because delete is a reserved word
     */
    del(
      name: string,
      path: string | RegExp,
      ...middleware: Array<Router.IMiddleware<StateT, CustomT>>
    ): Router<StateT, CustomT>;
    del(
      path: string | RegExp | Array<string | RegExp>,
      ...middleware: Array<Router.IMiddleware<StateT, CustomT>>
    ): Router<StateT, CustomT>;
    del<T, U>(
      name: string,
      path: string | RegExp,
      middleware: Koa.Middleware<T, U>,
      routeHandler: Router.IMiddleware<StateT & T, CustomT & U>
    ): Router<StateT & T, CustomT & U>;
    del<T, U>(
      path: string | RegExp | Array<string | RegExp>,
      middleware: Koa.Middleware<T, U>,
      routeHandler: Router.IMiddleware<StateT & T, CustomT & U>
    ): Router<StateT & T, CustomT & U>;

    // Additional signatures
    del<T1, U1, T2, U2>(
      path: string | RegExp | Array<string | RegExp>,
      middleware1: Koa.Middleware<T1, U1>,
      middleware2: Koa.Middleware<StateT & T1, CustomT & U1>,
      routeHandler: Router.IMiddleware<StateT & T1 & T2, CustomT & U1 & U2>
    ): Router<StateT & T1 & T2, CustomT & U1 & U2>;
    del<T1, U1, T2, U2, T3, U3>(
      path: string | RegExp | Array<string | RegExp>,
      middleware1: Koa.Middleware<T1, U1>,
      middleware2: Koa.Middleware<StateT & T1, CustomT & U1>,
      middleware3: Koa.Middleware<StateT & T1 & T2, CustomT & U1 & U2>,
      routeHandler: Router.IMiddleware<StateT & T1 & T2 & T3, CustomT & U1 & U2 & U3>
    ): Router<StateT & T1 & T2 & T3, CustomT & U1 & U2 & U3>;

    /**
     * HTTP head method
     */
    head(
      name: string,
      path: string | RegExp,
      ...middleware: Array<Router.IMiddleware<StateT, CustomT>>
    ): Router<StateT, CustomT>;
    head(
      path: string | RegExp | Array<string | RegExp>,
      ...middleware: Array<Router.IMiddleware<StateT, CustomT>>
    ): Router<StateT, CustomT>;
    head<T, U>(
      name: string,
      path: string | RegExp,
      middleware: Koa.Middleware<T, U>,
      routeHandler: Router.IMiddleware<StateT & T, CustomT & U>
    ): Router<StateT & T, CustomT & U>;
    head<T, U>(
      path: string | RegExp | Array<string | RegExp>,
      middleware: Koa.Middleware<T, U>,
      routeHandler: Router.IMiddleware<StateT & T, CustomT & U>
    ): Router<StateT & T, CustomT & U>;

    // Additional signatures
    head<T1, U1, T2, U2>(
      path: string | RegExp | Array<string | RegExp>,
      middleware1: Koa.Middleware<T1, U1>,
      middleware2: Koa.Middleware<StateT & T1, CustomT & U1>,
      routeHandler: Router.IMiddleware<StateT & T1 & T2, CustomT & U1 & U2>
    ): Router<StateT & T1 & T2, CustomT & U1 & U2>;
    head<T1, U1, T2, U2, T3, U3>(
      path: string | RegExp | Array<string | RegExp>,
      middleware1: Koa.Middleware<T1, U1>,
      middleware2: Koa.Middleware<StateT & T1, CustomT & U1>,
      middleware3: Koa.Middleware<StateT & T1 & T2, CustomT & U1 & U2>,
      routeHandler: Router.IMiddleware<StateT & T1 & T2 & T3, CustomT & U1 & U2 & U3>
    ): Router<StateT & T1 & T2 & T3, CustomT & U1 & U2 & U3>;

    /**
     * HTTP options method
     */
    options(
      name: string,
      path: string | RegExp,
      ...middleware: Array<Router.IMiddleware<StateT, CustomT>>
    ): Router<StateT, CustomT>;
    options(
      path: string | RegExp | Array<string | RegExp>,
      ...middleware: Array<Router.IMiddleware<StateT, CustomT>>
    ): Router<StateT, CustomT>;
    options<T, U>(
      name: string,
      path: string | RegExp,
      middleware: Koa.Middleware<T, U>,
      routeHandler: Router.IMiddleware<StateT & T, CustomT & U>
    ): Router<StateT & T, CustomT & U>;
    options<T, U>(
      path: string | RegExp | Array<string | RegExp>,
      middleware: Koa.Middleware<T, U>,
      routeHandler: Router.IMiddleware<StateT & T, CustomT & U>
    ): Router<StateT & T, CustomT & U>;

    // Additional signatures
    options<T1, U1, T2, U2>(
      path: string | RegExp | Array<string | RegExp>,
      middleware1: Koa.Middleware<T1, U1>,
      middleware2: Koa.Middleware<StateT & T1, CustomT & U1>,
      routeHandler: Router.IMiddleware<StateT & T1 & T2, CustomT & U1 & U2>
    ): Router<StateT & T1 & T2, CustomT & U1 & U2>;
    options<T1, U1, T2, U2, T3, U3>(
      path: string | RegExp | Array<string | RegExp>,
      middleware1: Koa.Middleware<T1, U1>,
      middleware2: Koa.Middleware<StateT & T1, CustomT & U1>,
      middleware3: Koa.Middleware<StateT & T1 & T2, CustomT & U1 & U2>,
      routeHandler: Router.IMiddleware<StateT & T1 & T2 & T3, CustomT & U1 & U2 & U3>
    ): Router<StateT & T1 & T2 & T3, CustomT & U1 & U2 & U3>;

    /**
     * HTTP patch method
     */
    patch(
      name: string,
      path: string | RegExp,
      ...middleware: Array<Router.IMiddleware<StateT, CustomT>>
    ): Router<StateT, CustomT>;
    patch(
      path: string | RegExp | Array<string | RegExp>,
      ...middleware: Array<Router.IMiddleware<StateT, CustomT>>
    ): Router<StateT, CustomT>;
    patch<T, U>(
      name: string,
      path: string | RegExp,
      middleware: Koa.Middleware<T, U>,
      routeHandler: Router.IMiddleware<StateT & T, CustomT & U>
    ): Router<StateT & T, CustomT & U>;
    patch<T, U>(
      path: string | RegExp | Array<string | RegExp>,
      middleware: Koa.Middleware<T, U>,
      routeHandler: Router.IMiddleware<StateT & T, CustomT & U>
    ): Router<StateT & T, CustomT & U>;

    // Additional signatures
    patch<T1, U1, T2, U2>(
      path: string | RegExp | Array<string | RegExp>,
      middleware1: Koa.Middleware<T1, U1>,
      middleware2: Koa.Middleware<StateT & T1, CustomT & U1>,
      routeHandler: Router.IMiddleware<StateT & T1 & T2, CustomT & U1 & U2>
    ): Router<StateT & T1 & T2, CustomT & U1 & U2>;
    patch<T1, U1, T2, U2, T3, U3>(
      path: string | RegExp | Array<string | RegExp>,
      middleware1: Koa.Middleware<T1, U1>,
      middleware2: Koa.Middleware<StateT & T1, CustomT & U1>,
      middleware3: Koa.Middleware<StateT & T1 & T2, CustomT & U1 & U2>,
      routeHandler: Router.IMiddleware<StateT & T1 & T2 & T3, CustomT & U1 & U2 & U3>
    ): Router<StateT & T1 & T2 & T3, CustomT & U1 & U2 & U3>;

    /**
     * Register route with all methods.
     */
    all(
      name: string,
      path: string | RegExp,
      ...middleware: Array<Router.IMiddleware<StateT, CustomT>>
    ): Router<StateT, CustomT>;
    all(
      path: string | RegExp | Array<string | RegExp>,
      ...middleware: Array<Router.IMiddleware<StateT, CustomT>>
    ): Router<StateT, CustomT>;
    all<T, U>(
      name: string,
      path: string | RegExp,
      middleware: Koa.Middleware<T, U>,
      routeHandler: Router.IMiddleware<StateT & T, CustomT & U>
    ): Router<StateT & T, CustomT & U>;
    all<T, U>(
      path: string | RegExp | Array<string | RegExp>,
      middleware: Koa.Middleware<T, U>,
      routeHandler: Router.IMiddleware<StateT & T, CustomT & U>
    ): Router<StateT & T, CustomT & U>;

    // Additional signatures
    all<T1, U1, T2, U2>(
      path: string | RegExp | Array<string | RegExp>,
      middleware1: Koa.Middleware<T1, U1>,
      middleware2: Koa.Middleware<StateT & T1, CustomT & U1>,
      routeHandler: Router.IMiddleware<StateT & T1 & T2, CustomT & U1 & U2>
    ): Router<StateT & T1 & T2, CustomT & U1 & U2>;
    all<T1, U1, T2, U2, T3, U3>(
      path: string | RegExp | Array<string | RegExp>,
      middleware1: Koa.Middleware<T1, U1>,
      middleware2: Koa.Middleware<StateT & T1, CustomT & U1>,
      middleware3: Koa.Middleware<StateT & T1 & T2, CustomT & U1 & U2>,
      routeHandler: Router.IMiddleware<StateT & T1 & T2 & T3, CustomT & U1 & U2 & U3>
    ): Router<StateT & T1 & T2 & T3, CustomT & U1 & U2 & U3>;

    /**
     * Set the path prefix for a Router instance that was already initialized.
     */
    prefix(prefix: string): Router<StateT, CustomT>;

    /**
     * Returns router middleware which dispatches a route matching the request.
     */
    routes(): Router.IMiddleware<StateT, CustomT>;

    /**
     * Returns router middleware which dispatches a route matching the request.
     */
    middleware(): Router.IMiddleware<StateT, CustomT>;

    /**
     * Returns separate middleware for responding to `OPTIONS` requests with
     * an `Allow` header containing the allowed methods, as well as responding
     * with `405 Method Not Allowed` and `501 Not Implemented` as appropriate.
     */
    allowedMethods(
      options?: Router.IRouterAllowedMethodsOptions
    ): Router.IMiddleware<StateT, CustomT>;

    /**
     * Redirect `source` to `destination` URL with optional 30x status `code`.
     *
     * Both `source` and `destination` can be route names.
     */
    redirect(source: string, destination: string, code?: number): Router<StateT, CustomT>;

    /**
     * Create and register a route.
     */
    register(
      path: string | RegExp,
      methods: string[],
      middleware: Router.IMiddleware<StateT, CustomT> | Array<Router.IMiddleware<StateT, CustomT>>,
      opts?: Router.ILayerOptions
    ): Router.Layer;

    /**
     * Lookup route with given `name`.
     */
    route(name: string): Router.Layer;
    route(name: string): boolean;

    /**
     * Generate URL for route. Takes either map of named `params` or series of
     * arguments (for regular expression routes)
     *
     * router = new Router();
     * router.get('user', "/users/:id", ...
     *
     * router.url('user', { id: 3 });
     * // => "/users/3"
     *
     * Query can be generated from third argument:
     *
     * router.url('user', { id: 3 }, { query: { limit: 1 } });
     * // => "/users/3?limit=1"
     *
     * router.url('user', { id: 3 }, { query: "limit=1" });
     * // => "/users/3?limit=1"
     *
     */
    url(name: string, params: any, options?: Router.IUrlOptionsQuery): string;
    url(name: string, params: any, options?: Router.IUrlOptionsQuery): Error;

    /**
     * Match given `path` and return corresponding routes.
     */
    match(path: string, method: string): Router.IRoutesMatch;

    /**
     * Run middleware for named route parameters. Useful for auto-loading or validation.
     */
    param(
      param: string,
      middleware: Router.IParamMiddleware<StateT, CustomT>
    ): Router<StateT, CustomT>;

    /**
     * Generate URL from url pattern and given `params`.
     */
    // eslint-disable-next-line @typescript-eslint/member-ordering
    static url(path: string | RegExp, params: Record<string, unknown>): string;
  }

  export = Router;
}
/* eslint-enable unicorn/prevent-abbreviations */
/* eslint-enable max-lines */
