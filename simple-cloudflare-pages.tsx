import { App, routes } from "app";
import { server, type ModuleStartParams } from "simple";

export async function cloudflarePages() {
  const params: ModuleStartParams = { routes, App };
  const { serveStatic } = await import("hono/cloudflare-pages");
  return server({ ...params, serveStatic });
}

const app = await cloudflarePages();
export default app;
