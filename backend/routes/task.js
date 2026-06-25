const express = require("express");
const axios = require("axios");
const { addLog } = require("./logs");

const router = express.Router();

let tasks = [];

// Add Task
router.post("/", async (req, res) => {
  const task = req.body;

  tasks.push(task);

  console.log("Task added:", task);

  const webhookUrl = process.env.N8N_DEADLINE_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const payload = {
        studentName: process.env.STUDENT_NAME || "Liya",
        phone: process.env.STUDENT_PHONE || "+919876543210",
        subject: task.subject,
        taskTitle: task.title,
        deadline: task.deadline
      };

      console.log("Triggering n8n deadline webhook:", webhookUrl);
      console.log("Payload:", payload);

      // Async post to n8n
      await axios.post(webhookUrl, payload);
      console.log("n8n webhook triggered successfully!");
      addLog("Deadline Created", task.title, "Success", `Google Calendar synced & WhatsApp reminders scheduled for ${task.subject}`);
    } catch (error) {
      console.error("Error triggering n8n webhook:", error.message);
      addLog("Deadline Created", task.title, "Failed", `n8n webhook failed: ${error.message}`);
    }
  } else {
    console.log("N8N_DEADLINE_WEBHOOK_URL not set in env, skipping webhook trigger.");
    addLog("Deadline Created", task.title, "Pending", "Local database updated. N8N Webhook is not configured in .env");
  }

  res.json({
    message: "Task Added Successfully 🎉",
  });
});


// Get All Tasks
router.get("/", (req, res) => {
  res.json(tasks);
});

module.exports = router;