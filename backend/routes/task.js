const express = require("express");

const router = express.Router();

const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

let tasks = [];

// Add Task
router.post("/", async (req, res) => {
  const task = req.body;

  tasks.push(task);

  try {
  await client.messages.create({
    body: `🎓 CampusFlow Reminder

Task: ${task.title}

Subject: ${task.subject}

Deadline: ${task.deadline}

Please complete your task on time.

- CampusFlow Team`,

    from: process.env.TWILIO_WHATSAPP_NUMBER,

    to: "whatsapp:+910000000000"
  });

  console.log("WhatsApp Message Sent Successfully");
} catch (error) {
  console.log(error);
}

  console.log(tasks);

  res.json({
    message: "Task Added Successfully 🎉",
  });
});

// Get All Tasks
router.get("/", (req, res) => {
  res.json(tasks);
});

module.exports = router;