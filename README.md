# Minimalist JS/TS full stack template

Features  
\---------

&nbsp;&nbsp;&nbsp;&nbsp;- SSR  
&nbsp;&nbsp;&nbsp;&nbsp;- Binary  
&nbsp;&nbsp;&nbsp;&nbsp;- Desktop (Tauri app.)  
&nbsp;&nbsp;&nbsp;&nbsp;- Cloudflare Pages  
&nbsp;&nbsp;&nbsp;&nbsp;- Edge  
&nbsp;&nbsp;&nbsp;&nbsp;- Routing (Hono/Wouter JS)  
&nbsp;&nbsp;&nbsp;&nbsp;- Tailwind/Shadcn (can be replaced by any UI library, or raw CSS)  
&nbsp;&nbsp;&nbsp;&nbsp;- Easily extensible  

  
Why?  
\------

I was seeking a straightforward boilerplate with minimal dependencies and no unnecessary complexities—something simple yet efficient. 
A single `app.tsx` file would suffice, although additional files may be included if desired.  

Install  
\------
```
bun i
```

Dev  
\----
```
bun run dev
```

Build (binary)  
\--------------
```
bun run build
```

Run (binary)  
\-------------
```
./app
```

Build (Cloudflare Pages)  
\------------------------
```
bun run build:app:pages
```

Deploy (Cloudflare Pages)  
\--------------------------
```
bun run deploy:app:pages
```
