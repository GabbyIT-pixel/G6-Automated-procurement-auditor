const app = require("./app");
const { testConnection } = require("./config/database");

const PORT = parseInt(process.env.PORT, 10) || 5000;

async function start() {
  // Verify the database is reachable before accepting traffic.
  await testConnection();

  app.listen(PORT, () => {
    console.log(`Procurement Auditor API listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});
