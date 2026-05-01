// src/server.js
import express from "express";
import testRoute from "./API/routes/test.route.js";
import tickRoute from "./API/routes/tick.route.js";
import replyRoute from "./API/routes/reply.route.js";
import healthRoute from "./API/routes/health.route.js";
import contextRoute from "./API/routes/context.route.js";
import metadataRoute from "./API/routes/metadata.route.js";






const app = express(); // <-- you forgot this line

// Middleware
app.use(express.json());

// Routes
app.use("/test", testRoute);
app.use("/v1", healthRoute);
app.use("/v1", tickRoute);
app.use("/v1", replyRoute);
app.use("/v1", contextRoute);
app.use("/v1", metadataRoute);
// Start server
const PORT = process.env.PORT ||  3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
