const express = require("express");

const router = express.Router();

let tasks = [];

// Add Task
router.post("/", (req, res) => {
  const task = req.body;

  tasks.push(task);

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