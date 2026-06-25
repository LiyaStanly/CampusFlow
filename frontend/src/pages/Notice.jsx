import { useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

function Notice() {
  const [noticeText, setNoticeText] = useState("");
  const [summary, setSummary] = useState("");

  const handleSummarize = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/ai/summarize",
        {
          noticeText: noticeText,
        }
      );

      setSummary(res.data.summary);
    } catch (error) {
      console.log(error);
      alert("AI Error");
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ padding: "30px", width: "100%" }}>
        <h1>📣 Notice Summarizer AI</h1>

        <textarea
          rows="10"
          cols="80"
          placeholder="Paste college notice here..."
          value={noticeText}
          onChange={(e) => setNoticeText(e.target.value)}
          style={{
            padding: "10px",
            marginTop: "20px",
          }}
        />

        <br />
        <br />

        <button
          onClick={handleSummarize}
          style={{
            padding: "12px",
            background: "#2563eb",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Summarize Notice
        </button>

        <h2 style={{ marginTop: "30px" }}>
          AI Summary
        </h2>

        <div
          style={{
            border: "1px solid #ccc",
            padding: "20px",
            borderRadius: "10px",
            minHeight: "150px",
          }}
        >
          {summary}
        </div>
      </div>
    </div>
  );
}

export default Notice;