import type { Env, Hono, MiddlewareHandler } from "hono";
import {
  MouseEventHandler,
  createContext,
  useCallback,
  useContext,
  useMemo,
  type Context,
  type ReactElement,
} from "react";
import { Router, Link as WouterLink, useLocation, useRouter } from "wouter";

export type ModuleStartParams = {
  routes: any;
  App: () => ReactElement;
};

export type Loader = (params: LoaderParams) => Response | PromiseLike<Response>;

export type LoaderParams = {
  env: Bindings;
  req: Request;
  params: any;
};

export type Routes = {
  [key: string]: ComponentRoute | ApiRoute;
};

export type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> &
  U[keyof U];

export type ApiRouteChild = ComponentRoute | Loader;

export type ApiRoute = AtLeastOne<{
  get?: ApiRouteChild;
  post?: ApiRouteChild;
  delete?: ApiRouteChild;
  patch?: ApiRouteChild;
  put?: ApiRouteChild;
}>;

export type ComponentRoute<T extends LoaderParams = LoaderParams> = {
  component: (params: { params: T["params"] }) => ReactElement;
  loader?: (params: T) => Promise<Record<string, unknown>>;
};

export function isComponentRoute(
  r: ComponentRoute | ApiRoute | ApiRouteChild,
): r is ComponentRoute {
  return (r as ComponentRoute)?.component !== undefined;
}

export let app: Hono<{ Bindings: Bindings }>;
export const STATIC_OUTPUT_DIR = "static";
export const X_LOADERDATA_REQUEST_HEADER = "X-LoaderData-Request";
export let useLoaderData: <T>() => T;

export const setUseLoaderData = (fn: typeof useLoaderData) => {
  useLoaderData = fn;
};

export const Link: typeof WouterLink = (props) => {
  const [_, navigate] = useLocation();
  const router = useRouter();

  const onClick = useCallback<MouseEventHandler>(
    (e) => {
      if (!props.href) {
        props.onClick?.(e);
        return;
      }

      for (const route of Object.keys(window.__routes)) {
        const { pattern, keys } = router.parser(route);
        const [$base, ...matches] = pattern.exec(props.href) || [];
        const [match, params] =
          $base !== undefined
            ? [
                true,
                Object.fromEntries(keys.map((key, i) => [key, matches[i]])),
              ]
            : [false, null];

        if (match) {
          e.preventDefault();
          e.stopPropagation();
          let navigateUrl: string;
          if (params) {
            const url = new URL(props.href, "https://a.com");
            for (const [key, value] of Object.entries(params)) {
              url.searchParams.set(key, value);
            }
            navigateUrl = url.pathname + url.search;
          } else {
            navigateUrl = props.href;
          }

          window.__loaderDataContext = null;
          fetch(navigateUrl, {
            headers: {
              [X_LOADERDATA_REQUEST_HEADER]: "load",
            },
          })
            .then((res) =>
              res.status === 204 ? Promise.resolve({}) : res.json(),
            )
            .then((jsonData: unknown) => {
              window.__loaderDataContext = jsonData;
              navigate(props.href, { state: jsonData });
            })
            .catch((err) => {
              console.error("error loading data", err);
              window.location.href = props.href;
            });
          break;
        }
      }
    },
    [props.href, props.onClick, router.parser, navigate],
  );

  const isRegularLink = useMemo(
    () => props.href?.startsWith("http"),
    [props.href],
  );

  return isRegularLink ? (
    <a {...props} />
  ) : (
    <WouterLink {...props} onClick={onClick} />
  );
};

async function makeRoutes({
  routes,
  serveStatic,
  LoaderDataContext,
  App,
}: ModuleStartParams & {
  serveStatic: () => MiddlewareHandler<Env>;
  LoaderDataContext: Context<any>;
}) {
  const { Hono } = await import("hono");
  const { renderToReadableStream } = await import("react-dom/server");

  app = new Hono<{ Bindings: Bindings }>();

  const renderApp = async ({
    routes,
    loadData,
    ssrPath,
    signal,
  }: {
    routes: any;
    loadData?: Record<string, unknown>;
    ssrPath: string;
    signal: AbortSignal;
  }) => {
    const stream = await renderToReadableStream(
      <LoaderDataContext.Provider value={loadData}>
        <Router ssrPath={ssrPath}>
          <App />
        </Router>
      </LoaderDataContext.Provider>,
      {
        bootstrapModules: ["/static/simple-browser.js"],
        bootstrapScriptContent: `
        window.__loaderDataContext = ${JSON.stringify(loadData)};
        window.__routes = ${JSON.stringify(routes)};`,
        signal,
      },
    );

    return new Response(stream, {
      headers: { "Content-Type": "text/html" },
    });
  };

  const bindComponentRoute = ({
    key,
    route,
    method,
  }: {
    key: Extract<keyof Routes, string>;
    route: ComponentRoute;
    method: keyof ApiRoute;
  }) => {
    app[method](key, async (c) => {
      const { loader } = route;
      const loadData = loader
        ? await loader({
            env: c.env ?? {},
            req: c.req.raw,
            params: c.req.param(),
          })
        : undefined;

      // fetch data before navigation
      if (c.req.header(X_LOADERDATA_REQUEST_HEADER)) {
        if (loadData) {
          return new Response(JSON.stringify(loadData), {
            headers: { "Content-Type": "application/json" },
          });
        }
        return new Response(undefined, {
          status: 204,
        });
      }
      // render html
      return await renderApp({
        routes,
        loadData,
        ssrPath: c.req.path,
        signal: c.req.raw.signal,
      });
    });
  };

  const bindApiRoute = ({
    key,
    loader,
    method,
  }: {
    key: Extract<keyof Routes, string>;
    loader: Loader;
    method: keyof ApiRoute;
  }) => {
    console.log("bind api route", key, method);
    app[method](key, async (c) => {
      return await loader({
        env: c.env ?? {},
        req: c.req.raw,
        params: c.req.param(),
      });
    });
  };

  app.use(`/${STATIC_OUTPUT_DIR}/*`, serveStatic());
  for (const routeKey of Object.keys(routes)) {
    const route = routes[routeKey];
    // Component route
    if (isComponentRoute(route)) {
      bindComponentRoute({ key: routeKey, method: "get", route });
    } else {
      for (const [method, r] of Object.entries(route as ApiRoute)) {
        if (r instanceof Function) {
          bindApiRoute({
            key: routeKey,
            method: method as keyof ApiRoute,
            loader: r,
          });
        } else {
          bindComponentRoute({
            key: routeKey,
            method: method as keyof ApiRoute,
            route: r,
          });
        }
      }
    }
  }

  app.get("/*", async (c) => {
    return await renderApp({
      routes,
      ssrPath: c.req.path,
      signal: c.req.raw.signal,
    });
  });
}

export async function server({
  routes,
  App,
  serveStatic,
}: ModuleStartParams & {
  serveStatic?: () => MiddlewareHandler<Env>;
}) {
  const LoaderDataContext = createContext<any>(null);

  setUseLoaderData(() => {
    const ctx = useContext(LoaderDataContext);
    return ctx;
  });

  await makeRoutes({
    routes,
    App,
    serveStatic: serveStatic ?? (await import("hono/bun")).serveStatic,
    LoaderDataContext,
  });

  return app;
}
