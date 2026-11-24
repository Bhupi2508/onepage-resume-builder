import { loadConfig } from "./config.js";
import { openDb } from "./db.js";
import { createApp } from "./app.js";

const config = loadConfig();
const db = openDb(config.databasePath);
const app = createApp({ db, config });

const server = app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port} (${config.production ? "production" : "development"})`);
  if (!app.locals.pdf.isAvailable()) console.warn("[warn] Chrome/Chromium not found: set CHROME_PATH to enable server-side PDF export.");
});
setInterval(() => app.locals.auth.purgeExpired(), 60 * 60 * 1000).unref();

const shutdown = async () => {
  server.close();
  await app.locals.pdf.close();
  db.close();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
