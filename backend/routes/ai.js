const express = require("express");
const Groq = require("groq-sdk");

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

router.post("/summarize", async (req, res) => {
  try {
    const { noticeText } = req.body;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "Summarize the college notice in exactly 3 bullet points.",
        },
        {
          role: "user",
          content: noticeText,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    res.json({
      summary: completion.choices[0].message.content,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "AI Error",
    });
  }
});

module.exports = router;