import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { Terminal, RefreshCw, CheckCircle2, AlertTriangle, PlayCircle, Info } from "lucide-react";

function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/logs");
      setLogs(res.data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // Auto-refresh logs every 10 seconds to make the dashboard feel alive
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Success":
        return (
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "5px 10px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "600",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            color: "#10b981",
            border: "1px solid rgba(16, 185, 129, 0.2)"
          }}>
            <CheckCircle2 size={12} /> Success
          </span>
        );
      case "Failed":
        return (
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "5px 10px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "600",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
            border: "1px solid rgba(239, 68, 68, 0.2)"
          }}>
            <AlertTriangle size={12} /> Failed
          </span>
        );
      default:
        return (
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "5px 10px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "600",
            backgroundColor: "rgba(245, 158, 11, 0.1)",
            color: "#f59e0b",
            border: "1px solid rgba(245, 158, 11, 0.2)"
          }}>
            <PlayCircle size={12} /> Pending
          </span>
        );
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#0f172a", color: "#f8fafc" }}>
      <Sidebar />

      <div style={{ flex: 1, padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", width: "100%" }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#f1f5f9", display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
              <Terminal className="text-teal-400" />
              n8n Workflow Execution Logs
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "5px", margin: 0 }}>
              Monitor live webhook logs, automated calendar updates, and WhatsApp broadcasts in real-time.
            </p>
          </div>
          <button
            onClick={fetchLogs}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              borderRadius: "8px",
              backgroundColor: "#1e293b",
              color: "#cbd5e1",
              border: "1px solid #334155",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#334155"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#1e293b"}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {loading ? "Refreshing..." : "Refresh Logs"}
          </button>
        </div>

        {/* Table list */}
        <div style={{
          backgroundColor: "#1e293b",
          border: "1px solid #334155",
          borderRadius: "12px",
          overflow: "hidden"
        }}>
          {logs.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
              No automation logs captured yet. Try adding a task or broadcasting a notice to trigger webhooks.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #334155", backgroundColor: "#0f172a" }}>
                    <th style={{ padding: "16px", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "#94a3b8" }}>Timestamp</th>
                    <th style={{ padding: "16px", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "#94a3b8" }}>Event / Action</th>
                    <th style={{ padding: "16px", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "#94a3b8" }}>Target</th>
                    <th style={{ padding: "16px", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "#94a3b8" }}>Webhook Status</th>
                    <th style={{ padding: "16px", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "#94a3b8" }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => (
                    <tr 
                      key={log.id || index} 
                      style={{ 
                        borderBottom: "1px solid #334155", 
                        backgroundColor: index % 2 === 0 ? "transparent" : "#1e293b" 
                      }}
                    >
                      <td style={{ padding: "16px", fontSize: "14px", color: "#cbd5e1" }}>
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td style={{ padding: "16px", fontSize: "14px", fontWeight: "600", color: "#f1f5f9" }}>
                        {log.event}
                      </td>
                      <td style={{ padding: "16px", fontSize: "14px", color: "#94a3b8" }}>
                        {log.target}
                      </td>
                      <td style={{ padding: "16px" }}>
                        {getStatusBadge(log.status)}
                      </td>
                      <td style={{ padding: "16px", fontSize: "13px", color: "#cbd5e1" }}>
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Demo Tip Info */}
        <div style={{
          display: "flex",
          gap: "12px",
          padding: "20px",
          borderRadius: "10px",
          backgroundColor: "rgba(14, 116, 144, 0.1)",
          border: "1px solid rgba(14, 116, 144, 0.2)",
          marginTop: "30px",
          alignItems: "start"
        }}>
          <Info size={20} className="text-cyan-400" />
          <div>
            <p style={{ fontSize: "14px", fontWeight: "700", color: "#22d3ee", margin: 0 }}>Presenter Tip for the Live Demo:</p>
            <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px", margin: 0, lineHeight: "1.5" }}>
              Keep this tab open or on split-screen when you pitch! When you create a deadline or paste a notice, this log screen will instantly display a <strong>"Success"</strong> badge indicating that your backend successfully handed off the task to n8n for calendar syncing and WhatsApp alert delivery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Logs;