require("dotenv").config();

const express = require("express");
const cors = require("cors");
const aiRoutes = require("./routes/ai");
const taskRoutes = require("./routes/task");
const attendanceRoutes = require("./routes/attendance");
const noticeRoutes = require("./routes/notice");
const { router: logsRoutes } = require("./routes/logs");

const app = express();

app.use(cors());
app.use(express.json());

// Routes middleware
app.use("/ai", aiRoutes);
app.use("/task", taskRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/notice", noticeRoutes);
app.use("/logs", logsRoutes);

app.get("/", (req, res) => {
  res.send("CampusFlow Backend Running 🚀");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});