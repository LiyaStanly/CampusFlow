const express = require("express");

const axios = require("axios");

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

  // Send WhatsApp Message
  try {
    await client.messages.create({
      body: `🎓 CampusFlow Reminder

Task: ${task.title}

Subject: ${task.subject}

Deadline: ${task.deadline}

Please complete your task on time.

- CampusFlow Team`,

      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: "whatsapp:+910000000000" // Replace with the user's WhatsApp number
    });

    console.log("WhatsApp Message Sent Successfully");

  } catch (error) {
    console.log("Twilio Error:", error.message);
  }


  // Send data to n8n
  try {

    await axios.post(
      process.env.N8N_WEBHOOK_URL,
      {
        taskTitle: task.title,
        subject: task.subject,
        deadline: task.deadline
      }
    );

    console.log("Data sent to n8n");

  } catch (error) {

    console.log("n8n Error:", error.message);

  }

  res.json({
    message: "Task Added Successfully 🎉"
  });

});

// Get All Tasks
router.get("/", (req, res) => {
  res.json(tasks);
});

module.exports = router;