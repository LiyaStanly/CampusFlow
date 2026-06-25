const express = require("express");
const router = express.Router();

let logs = [
  {
    id: "log_initial",
    timestamp: new Date().toISOString(),
    event: "System Startup",
    target: "CampusFlow Automation Engine",
    status: "Success",
    details: "Backend server initialized on port 5000. Ready to stream webhook logs."
  }
];

// Helper to append a log entry
function addLog(event, target, status, details = "") {
  logs.unshift({
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    event,
    target,
    status,
    details
  });
}

// GET all logs
router.get("/", (req, res) => {
  res.json(logs);
});

module.exports = {
  router,
  addLog
};
