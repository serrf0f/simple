import React from "react";
import type { Theme } from "./theme-provider";

export interface ThemeModeScriptProps
  extends React.ComponentPropsWithoutRef<"script"> {
  mode?: Theme;
}

export const ThemeModeScript = ({ mode, ...others }: ThemeModeScriptProps) => {
  return (
    <script
      {...others}
      dangerouslySetInnerHTML={{
        __html: getScript({
          mode,
          defaultMode: "system",
          localStorageKey: "theme",
        }),
      }}
    />
  );
};

function getScript({
  mode,
  defaultMode,
  localStorageKey,
}: {
  mode?: Theme;
  defaultMode: Theme;
  localStorageKey: string;
}) {
  return `
    try {
      const mode = window.localStorage.getItem('${localStorageKey}') ?? '${mode}' ?? '${defaultMode}';
      const computedMode =
        mode === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : mode;

      if (computedMode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  `;
}
