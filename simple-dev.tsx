import { App, routes } from "app";
import { server } from "simple";

export async function dev() {
  return server({ routes, App });
}

const app = await dev();
export default app;
