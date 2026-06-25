const express = require("express");
const axios = require("axios");
const router = express.Router();

let attendanceData = [];

// Get all attendance records
router.get("/", (req, res) => {
  res.json(attendanceData);
});

// Add or update attendance
router.post("/", (req, res) => {
  const { 
    subject, 
    hasLab, 
    theoryConducted, 
    theoryAttended, 
    labConducted, 
    labAttended 
  } = req.body;

  if (!subject) {
    return res.status(400).json({ error: "Subject name is required" });
  }

  const tConducted = Number(theoryConducted);
  const tAttended = Number(theoryAttended);

  if (isNaN(tConducted) || isNaN(tAttended) || tConducted < 0 || tAttended < 0) {
    return res.status(400).json({ error: "Invalid numbers for Theory classes" });
  }

  if (tAttended > tConducted) {
    return res.status(400).json({ error: "Attended Theory classes cannot exceed Conducted Theory classes" });
  }

  let lConducted = 0;
  let lAttended = 0;

  if (hasLab) {
    lConducted = Number(labConducted);
    lAttended = Number(labAttended);

    if (isNaN(lConducted) || isNaN(lAttended) || lConducted < 0 || lAttended < 0) {
      return res.status(400).json({ error: "Invalid numbers for Lab classes" });
    }

    if (lAttended > lConducted) {
      return res.status(400).json({ error: "Attended Lab classes cannot exceed Conducted Lab classes" });
    }
  }

  const theoryPercent = tConducted > 0 ? Math.round((tAttended / tConducted) * 100) : 0;
  const labPercent = (hasLab && lConducted > 0) ? Math.round((lAttended / lConducted) * 100) : 0;

  const index = attendanceData.findIndex(
    (item) => item.subject.toLowerCase() === subject.toLowerCase()
  );

  const newRecord = {
    id: index !== -1 ? attendanceData[index].id : Date.now().toString(),
    subject,
    hasLab: !!hasLab,
    theoryConducted: tConducted,
    theoryAttended: tAttended,
    theoryPercent,
    labConducted: hasLab ? lConducted : 0,
    labAttended: hasLab ? lAttended : 0,
    labPercent: hasLab ? labPercent : 0
  };

  if (index !== -1) {
    attendanceData[index] = newRecord;
  } else {
    attendanceData.push(newRecord);
  }

  res.json({
    message: "Attendance saved successfully!",
    record: newRecord
  });
});

// Delete attendance record
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  attendanceData = attendanceData.filter((item) => item.id !== id);
  res.json({ message: "Attendance record deleted!" });
});

// Trigger n8n webhook for WhatsApp alert
router.post("/alert", async (req, res) => {
  const { 
    subject, 
    type, // "Theory" or "Lab" or "Overall"
    percentage, 
    status, 
    classesNeeded,
    classesMissable,
    targetPercent
  } = req.body;

  const webhookUrl = process.env.N8N_ATTENDANCE_WEBHOOK_URL;

  const payload = {
    studentName: "Liya", // Default student for demo
    phone: process.env.STUDENT_PHONE || "+919876543210", 
    subject,
    type, // "Theory" or "Lab"
    percentage: `${percentage}%`,
    targetPercent: `${targetPercent}%`,
    status,
    classesNeeded: classesNeeded || 0,
    classesMissable: classesMissable || 0,
    timestamp: new Date().toISOString()
  };

  console.log("Triggering n8n alert webhook:", webhookUrl);
  console.log("Payload:", payload);

  if (!webhookUrl) {
    return res.json({
      success: true,
      simulated: true,
      message: `WhatsApp alert simulated for ${subject} (${type})!`,
      payload
    });
  }

  try {
    const response = await axios.post(webhookUrl, payload);
    res.json({
      success: true,
      message: "WhatsApp alert sent successfully via n8n!",
      data: response.data
    });
  } catch (error) {
    console.error("Error triggering n8n webhook:", error.message);
    res.status(500).json({
      error: "Failed to trigger n8n webhook",
      details: error.message,
      payload
    });
  }
});

module.exports = router;
