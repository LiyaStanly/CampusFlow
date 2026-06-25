require("dotenv").config();

const express = require("express");
const cors = require("cors");
const aiRoutes = require("./routes/ai");
const app = express();

const taskRoutes = require("./routes/task");

app.use(cors());
app.use(express.json());
app.use("/ai", aiRoutes);
app.use("/task", taskRoutes);
app.use("/ai", aiRoutes);

app.get("/", (req, res) => {
  res.send("CampusFlow Backend Running 🚀");
});

app.use("/task", taskRoutes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});