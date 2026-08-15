/**
 * Vercel Serverless Function entry point.
 *
 * vinext's production server (dist/server, built by `vinext build`) is designed to
 * bind to a port and listen — there's no native Vercel/Nitro adapter that works with
 * this project today (see vite.config.ts history). Instead, this starts vinext's real
 * Node server once on 127.0.0.1 inside the function's container (surviving warm
 * invocations) and proxies each Vercel request to it over loopback, which reuses
 * vinext's actual request handling (routing, RSC, static assets) unmodified.
 */
import path from "node:path";
import http, { type IncomingMessage, type ServerResponse } from "node:http";
import { startProdServer } from "vinext/server/prod-server";

let serverPromise: ReturnType<typeof startProdServer> | null = null;

function getServer() {
  serverPromise ??= startProdServer({
    port: 0,
    host: "127.0.0.1",
    outDir: path.join(process.cwd(), "dist"),
    silent: true,
  });
  return serverPromise;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const { port } = await getServer();

  const proxyReq = http.request(
    {
      hostname: "127.0.0.1",
      port,
      path: req.url,
      method: req.method,
      headers: req.headers,
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
      proxyRes.pipe(res);
    },
  );

  proxyReq.on("error", (error) => {
    console.error("[vercel-adapter] proxy request failed", error);
    if (!res.headersSent) res.writeHead(502);
    res.end("Bad Gateway");
  });

  req.pipe(proxyReq);
}
