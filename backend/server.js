require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { connectDB } = require("./config/db");
const { errorHandler } = require("./middleware/errorHandler");

const electionRoutes = require("./routes/electionRoutes");
const voterRoutes = require("./routes/voterRoutes");
const auditRoutes = require("./routes/auditRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/elections", electionRoutes);
app.use("/api/voters", voterRoutes);
app.use("/api/audit", auditRoutes);

// 404 for unmatched API routes
app.use("/api", (req, res) => res.status(404).json({ error: "Not found" }));

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/the_ledger";

connectDB(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    console.error("The frontend's Demo Mode does not require this API — it will keep working without it.");
    process.exit(1);
  });
