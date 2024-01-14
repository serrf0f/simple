import { ThemeModeScript } from "@shadcn/components/theme-mode-script";
import { ModeToggle } from "@shadcn/components/ui/mode-toggle";
import { type ReactElement, type ReactNode } from "react";
import { Link, STATIC_OUTPUT_DIR, app, useLoaderData } from "simple";
import { Route, Switch } from "wouter";

export const routes = {
  "/": {
    component: Home,
    loader: homeLoader,
  },
  "/user/:id": {
    component: User,
    loader: userLoader,
  },
  "/routing": { component: Routing },
  "/:rest*": { component: Error404 },
};

export function App() {
  return (
    <html lang="en">
      <head>
        <title>Simple</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href={`/${STATIC_OUTPUT_DIR}/output.css`} rel="stylesheet" />
        <ThemeModeScript />
      </head>
      <body className="min-h-screen w-screen dark:bg-zinc-900 dark:text-zinc-300">
        <Switch>
          {Object.keys(routes).map((k) => (
            <Route
              key={`_route_${k}`}
              path={k}
              component={
                routes[k as keyof typeof routes].component as () => ReactElement
              }
            />
          ))}
        </Switch>
      </body>
    </html>
  );
}

function Error404() {
  return (
    <div className="flex h-full min-h-screen flex-col items-center justify-center space-y-12">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        404.
      </h1>
      <Link className="text-foreground underline underline-offset-4" href="/">
        Home
      </Link>
    </div>
  );
}

function User({ params: { id } }: { params: { id: string } }) {
  const {
    user: { name },
  } = useLoaderData<Awaited<ReturnType<typeof userLoader>>>();

  return (
    <div className="flex h-full min-h-screen flex-col items-center justify-center space-y-12">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Hello <span>{name ?? id}</span>
      </h1>
      <Link className="text-foreground underline underline-offset-4" href="/">
        Home
      </Link>
    </div>
  );
}

async function userLoader({
  req,
  params: { id },
}: { req: Request; params: { id: string } }) {
  return {
    user: {
      id,
      name: "John",
    },
  };
}

function Routing() {
  return (
    <div className="flex h-full min-h-screen flex-col items-center justify-center space-y-12">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Another route.
      </h1>
      <div className="flex space-x-3">
        <Link
          className="text-foreground underline underline-offset-4"
          href="https://github.com/molefrog/wouter"
          target="_blank"
          rel="noreferrer"
        >
          Wouter on Github
        </Link>
        <Link className="text-foreground underline underline-offset-4" href="/">
          Home
        </Link>
      </div>
    </div>
  );
}

function Home() {
  const { tags } = useLoaderData<Awaited<ReturnType<typeof homeLoader>>>();

  return (
    <div className="flex h-full min-h-screen flex-col items-center justify-center space-y-12">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        One file, simple.
      </h1>

      <div className="flex max-w-md flex-wrap items-top justify-center space-x-2">
        {tags.map(({ label, href }) =>
          href ? (
            <Link
              key={`tag-${label}`}
              href={href}
              target={href.startsWith("http") ? "_blank" : "_self"}
            >
              <Code>{label}</Code>
            </Link>
          ) : (
            <Code key={`tag-${label}`}>{label}</Code>
          ),
        )}
      </div>
      <ModeToggle />
    </div>
  );
}

function homeLoader() {
  return Promise.resolve({
    tags: [
      { label: "JS/TS" },
      { label: "SSR" },
      { label: "Desktop" },
      { label: "Binary" },
      { label: "Web" },
      { label: "Cloudflare", href: "https://pages.cloudflare.com" },
      { label: "React", href: "https://react.dev" },
      { label: "Bun", href: "https://bun.sh" },
      { label: "Tauri", href: "https://tauri.app" },
      { label: "Tailwind", href: "https://tailwindcss.com" },
      { label: "Shadcn", href: "https://ui.shadcn.com" },
      { label: "Wouter", href: "/routing" },
      { label: "User", href: "/user/223" },
    ],
  });
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="mb-1 bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
      {children}
    </code>
  );
}

export default app;
