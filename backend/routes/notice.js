const express = require("express");
const axios = require("axios");
const { addLog } = require("./logs");
const router = express.Router();

// Broadcast a college notice
router.post("/", async (req, res) => {
  const { noticeText, eventDate, eventTitle } = req.body;

  if (!noticeText || !eventDate || !eventTitle) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  console.log("Notice received:", { eventTitle, eventDate });

  const webhookUrl = process.env.N8N_NOTICE_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      // n8n expects: { noticeText, eventDate, eventTitle, phoneList[] }
      const payload = {
        noticeText,
        eventDate,
        eventTitle,
        phoneList: [
          process.env.STUDENT_PHONE || "+919876543210"
        ]
      };

      console.log("Triggering n8n notice webhook:", webhookUrl);
      console.log("Payload:", payload);

      await axios.post(webhookUrl, payload);
      console.log("n8n notice webhook triggered successfully!");
      addLog("Notice Broadcast", eventTitle, "Success", `Broadcasted AI summary of notice directly to WhatsApp contacts.`);
    } catch (error) {
      console.error("Error triggering n8n notice webhook:", error.message);
      addLog("Notice Broadcast", eventTitle, "Failed", `n8n broadcast failed: ${error.message}`);
    }
  } else {
    console.log("N8N_NOTICE_WEBHOOK_URL is not set, skipping webhook trigger.");
    addLog("Notice Broadcast", eventTitle, "Pending", "Notice saved. N8N Webhook for notice broadcasts is not configured in .env");
  }

  res.json({
    message: "Notice broadcasted successfully!",
  });
});


module.exports = router;
