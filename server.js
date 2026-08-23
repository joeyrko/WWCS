// Custom production entry point for hosts (e.g. Hostinger's Node.js App
// panel) that run a plain JS "startup file" via their own process manager
// rather than invoking the `next start` CLI binary directly.
//
// Requires `next build` to have already produced a production build.
const { createServer } = require("http");
const next = require("next");

const port = parseInt(process.env.PORT || "3000", 10);
const hostname = process.env.HOSTNAME || "0.0.0.0";

// Create the HTTP server first and hand it to Next via the `httpServer`
// option so Next's own lifecycle/shutdown handling (SIGTERM/SIGINT, in-flight
// request draining) manages this exact instance. Without this, Next tracks
// an internal server that was never listen()'d and crashes with
// "Error: Server is not running" when it tries to close that phantom server
// during a restart.
const httpServer = createServer();
const app = next({ dev: false, hostname, port, httpServer });
const handle = app.getRequestHandler();

httpServer.on("request", (req, res) => {
  handle(req, res);
});

app
  .prepare()
  .then(() => {
    httpServer.listen(port, hostname, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });

// Next's programmatic API (unlike the `next start` CLI) registers no
// SIGTERM/SIGINT handling of its own, so without this the host's redeploy
// signal just kills the process mid-request. Guarded with `shuttingDown` and
// `httpServer.listening` because a host can send the signal twice, or before
// `listen()` above has even resolved — closing a server that was created but
// never started throws "Error: Server is not running".
let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`> Received ${signal}, shutting down...`);
  if (!httpServer.listening) {
    process.exit(0);
    return;
  }
  httpServer.close((err) => {
    if (err) console.error("Error during shutdown:", err);
    process.exit(err ? 1 : 0);
  });
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
