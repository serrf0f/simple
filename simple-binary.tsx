import { App, routes } from "app.tsx";
import type { Env, MiddlewareHandler } from "hono";
import { server, type ModuleStartParams } from "simple";

async function binary() {
  const params: ModuleStartParams = { routes, App };
  const { default: mime } = await import("mime-types");
  const resources = {
    "/static/output.css": (await import("./static/output.css")).default,
    "/static/simple-browser.js": (await import("./static/simple-browser.txt"))
      .default,
  };

  const serveStatic: () => MiddlewareHandler<Env> = () => {
    return async (c, next) => {
      if (c.req.path in resources) {
        return Promise.resolve(
          new Response(
            Bun.file(resources[c.req.path as keyof typeof resources]),
            {
              headers: {
                "Content-Type":
                  mime.contentType(c.req.path.split("/").pop() as string) ||
                  "application/octet-stream",
              },
            },
          ),
        );
      }

      return next();
    };
  };
  return server({
    ...params,
    serveStatic,
  });
}

const app = await binary();
export default app;
