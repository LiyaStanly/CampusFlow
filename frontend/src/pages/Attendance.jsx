import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

function Attendance() {
  const [attendanceList, setAttendanceList] = useState([]);
  const [targetPercent, setTargetPercent] = useState(75); // 75% (Mid-Sem) or 85% (End-Sem)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    hasLab: false,
    theoryConducted: "",
    theoryAttended: "",
    labConducted: "",
    labAttended: "",
  });
  const [loading, setLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null); // { message: '', type: 'success' | 'error' | 'info' }

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await axios.get("http://localhost:5000/attendance");
      setAttendanceList(res.data);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      showNotification("Failed to load attendance list.", "error");
    }
  };

  const showNotification = (message, type = "success") => {
    setAlertInfo({ message, type });
    setTimeout(() => {
      setAlertInfo(null);
    }, 4000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim()) {
      showNotification("Please enter a subject name.", "error");
      return;
    }

    if (form.theoryConducted === "" || form.theoryAttended === "") {
      showNotification("Please enter both Theory Conducted and Attended classes.", "error");
      return;
    }

    const tConducted = Number(form.theoryConducted);
    const tAttended = Number(form.theoryAttended);

    if (isNaN(tConducted) || isNaN(tAttended) || tConducted < 0 || tAttended < 0) {
      showNotification("Theory class counts must be valid positive numbers.", "error");
      return;
    }

    if (tAttended > tConducted) {
      showNotification("Attended Theory classes cannot exceed Conducted Theory classes.", "error");
      return;
    }

    let lConducted = 0;
    let lAttended = 0;

    if (form.hasLab) {
      if (form.labConducted === "" || form.labAttended === "") {
        showNotification("Please enter both Lab Conducted and Attended classes.", "error");
        return;
      }

      lConducted = Number(form.labConducted);
      lAttended = Number(form.labAttended);

      if (isNaN(lConducted) || isNaN(lAttended) || lConducted < 0 || lAttended < 0) {
        showNotification("Lab class counts must be valid positive numbers.", "error");
        return;
      }

      if (lAttended > lConducted) {
        showNotification("Attended Lab classes cannot exceed Conducted Lab classes.", "error");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/attendance", {
        subject: form.subject.trim(),
        hasLab: form.hasLab,
        theoryConducted: tConducted,
        theoryAttended: tAttended,
        labConducted: lConducted,
        labAttended: lAttended,
      });

      showNotification(res.data.message || "Attendance saved successfully!", "success");
      setForm({
        subject: "",
        hasLab: false,
        theoryConducted: "",
        theoryAttended: "",
        labConducted: "",
        labAttended: "",
      });
      setIsFormOpen(false);
      fetchAttendance();
    } catch (error) {
      console.error("Error saving attendance:", error);
      const errMsg = error.response?.data?.error || "Error saving attendance details.";
      showNotification(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subject?")) return;

    try {
      await axios.delete(`http://localhost:5000/attendance/${id}`);
      showNotification("Subject deleted.", "success");
      fetchAttendance();
    } catch (error) {
      console.error("Error deleting attendance:", error);
      showNotification("Error deleting record.", "error");
    }
  };

  const handleQuickIncrement = async (item, field, type) => {
    let theoryCon = item.theoryConducted;
    let theoryAtt = item.theoryAttended;
    let labCon = item.labConducted;
    let labAtt = item.labAttended;

    if (type === "theory") {
      if (field === "present") {
        theoryCon += 1;
        theoryAtt += 1;
      } else {
        theoryCon += 1;
      }
    } else {
      if (field === "present") {
        labCon += 1;
        labAtt += 1;
      } else {
        labCon += 1;
      }
    }

    try {
      await axios.post("http://localhost:5000/attendance", {
        subject: item.subject,
        hasLab: item.hasLab,
        theoryConducted: theoryCon,
        theoryAttended: theoryAtt,
        labConducted: labCon,
        labAttended: labAtt,
      });
      fetchAttendance();
      showNotification(`Updated ${type === "theory" ? "Theory" : "Lab"} attendance for ${item.subject}!`, "success");
    } catch (error) {
      console.error("Error updating attendance:", error);
      showNotification("Failed to update attendance.", "error");
    }
  };

  const triggerWhatsAppAlert = async (item, type, stats) => {
    showNotification(`Triggering WhatsApp alert for ${item.subject} (${type})...`, "info");
    try {
      const res = await axios.post("http://localhost:5000/attendance/alert", {
        subject: item.subject,
        type,
        percentage: stats.percentage,
        status: stats.status,
        classesNeeded: stats.classesNeeded,
        classesMissable: stats.classesMissable,
        targetPercent,
      });

      if (res.data.simulated) {
        showNotification(`Simulated alert generated for ${item.subject} (${type})!`, "success");
      } else {
        showNotification(`WhatsApp alert sent via n8n!`, "success");
      }
    } catch (error) {
      console.error("Error sending alert:", error);
      showNotification("Failed to send WhatsApp alert.", "error");
    }
  };

  // Logic to calculate status and required/missable classes based on active target percentage
  const calculateStats = (conducted, attended) => {
    const total = Number(conducted);
    const att = Number(attended);
    const target = targetPercent / 100;
    const percentage = total > 0 ? Math.round((att / total) * 100) : 0;
    const status = percentage < targetPercent ? "At Risk" : "Safe";

    let classesNeeded = 0;
    let classesMissable = 0;

    if (percentage < targetPercent) {
      classesNeeded = Math.ceil((target * total - att) / (1 - target));
      if (classesNeeded < 0) classesNeeded = 0;
    } else {
      classesMissable = Math.floor((att - target * total) / target);
      if (classesMissable < 0) classesMissable = 0;
    }

    return { percentage, status, classesNeeded, classesMissable };
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#0b0f19" }}>
      <Sidebar />

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: "40px", color: "#f3f4f6", backgroundColor: "#0b0f19", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        
        {/* Floating Notification */}
        {alertInfo && (
          <div
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              padding: "15px 25px",
              borderRadius: "8px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.4)",
              zIndex: 1000,
              fontWeight: "600",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              transition: "all 0.3s ease",
              background:
                alertInfo.type === "success"
                  ? "linear-gradient(135deg, #059669, #10b981)"
                  : alertInfo.type === "error"
                  ? "linear-gradient(135deg, #dc2626, #ef4444)"
                  : "linear-gradient(135deg, #2563eb, #3b82f6)",
            }}
          >
            <span>
              {alertInfo.type === "success" ? (
                <svg style={{ width: "18px", height: "18px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              ) : alertInfo.type === "error" ? (
                <svg style={{ width: "18px", height: "18px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg style={{ width: "18px", height: "18px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )}
            </span>
            <span>{alertInfo.message}</span>
          </div>
        )}

        {/* Page Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "35px", flexWrap: "wrap", gap: "15px" }}>
          <div>
            <h1 style={{ margin: "0", fontSize: "36px", fontWeight: "700", color: "#ffffff", letterSpacing: "-0.75px" }}>
              Attendance Risk Alerter
            </h1>
            <p style={{ margin: "5px 0 0", color: "#9ca3af", fontSize: "16px" }}>
              Monitor and maintain required margins for both Mid-Semester and End-Semester exams.
            </p>
          </div>
          
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            style={{
              padding: "10px 20px",
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              border: "none",
              color: "white",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "transform 0.1s, opacity 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.97)"}
            onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            {isFormOpen ? (
              <>
                <svg style={{ width: "16px", height: "16px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                Close Form
              </>
            ) : (
              <>
                <svg style={{ width: "16px", height: "16px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Add Subject
              </>
            )}
          </button>
        </div>

        {/* Target Policy Toggle Tab Bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "30px", padding: "6px", backgroundColor: "#111827", borderRadius: "10px", width: "max-content", border: "1px solid #1f2937" }}>
          <button
            onClick={() => setTargetPercent(75)}
            style={{
              padding: "8px 16px",
              border: "none",
              borderRadius: "6px",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "14px",
              transition: "all 0.2s",
              backgroundColor: targetPercent === 75 ? "#4f46e5" : "transparent",
              color: targetPercent === 75 ? "#ffffff" : "#9ca3af",
            }}
          >
            Mid-Sem Target (75%)
          </button>
          
          <button
            onClick={() => setTargetPercent(85)}
            style={{
              padding: "8px 16px",
              border: "none",
              borderRadius: "6px",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "14px",
              transition: "all 0.2s",
              backgroundColor: targetPercent === 85 ? "#4f46e5" : "transparent",
              color: targetPercent === 85 ? "#ffffff" : "#9ca3af",
            }}
          >
            End-Sem Target (85%)
          </button>
        </div>

        {/* Collapsible Form Card overlay */}
        {isFormOpen && (
          <div style={{
            backgroundColor: "#111827",
            border: "1px solid #1f2937",
            borderRadius: "12px",
            padding: "30px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
            marginBottom: "35px",
            maxWidth: "600px"
          }}>
            <h3 style={{ margin: "0 0 20px", fontSize: "18px", fontWeight: "600", color: "#f3f4f6" }}>
              Add Subject Details
            </h3>
            
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", color: "#9ca3af", fontWeight: "500" }}>Subject Name</label>
                <input
                  type="text"
                  name="subject"
                  placeholder="e.g. DBMS, OS, Machine Learning"
                  value={form.subject}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              {/* Lab Course checkbox */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "5px" }}>
                <input
                  type="checkbox"
                  id="hasLab"
                  name="hasLab"
                  checked={form.hasLab}
                  onChange={handleChange}
                  style={{ width: "16px", height: "16px", accentColor: "#4f46e5", cursor: "pointer" }}
                />
                <label htmlFor="hasLab" style={{ fontSize: "14px", color: "#e5e7eb", fontWeight: "500", cursor: "pointer" }}>
                  Does this subject include a Practical / Lab course?
                </label>
              </div>

              {/* Grid for Theory and Lab fields */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px", marginTop: "10px" }}>
                
                {/* Theory Section */}
                <div style={{ borderLeft: "3px solid #4f46e5", paddingLeft: "15px" }}>
                  <h4 style={{ margin: "0 0 10px", fontSize: "14px", color: "#818cf8", fontWeight: "600" }}>Theory Section</h4>
                  <div style={{ display: "flex", gap: "15px" }}>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "5px" }}>
                      <label style={{ fontSize: "12px", color: "#9ca3af" }}>Conducted So Far</label>
                      <input
                        type="number"
                        name="theoryConducted"
                        value={form.theoryConducted}
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder="e.g. 10"
                        min="0"
                      />
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "5px" }}>
                      <label style={{ fontSize: "12px", color: "#9ca3af" }}>Attended</label>
                      <input
                        type="number"
                        name="theoryAttended"
                        value={form.theoryAttended}
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder="e.g. 8"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Practical Section (Conditional) */}
                {form.hasLab && (
                  <div style={{ borderLeft: "3px solid #0891b2", paddingLeft: "15px" }}>
                    <h4 style={{ margin: "0 0 10px", fontSize: "14px", color: "#22d3ee", fontWeight: "600" }}>Practical / Lab Section</h4>
                    <div style={{ display: "flex", gap: "15px" }}>
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "5px" }}>
                        <label style={{ fontSize: "12px", color: "#9ca3af" }}>Conducted So Far</label>
                        <input
                          type="number"
                          name="labConducted"
                          value={form.labConducted}
                          onChange={handleChange}
                          style={inputStyle}
                          placeholder="e.g. 5"
                          min="0"
                        />
                      </div>
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "5px" }}>
                        <label style={{ fontSize: "12px", color: "#9ca3af" }}>Attended</label>
                        <input
                          type="number"
                          name="labAttended"
                          value={form.labAttended}
                          onChange={handleChange}
                          style={inputStyle}
                          placeholder="e.g. 4"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...buttonStyle,
                  background: loading 
                    ? "#374151" 
                    : "linear-gradient(135deg, #6366f1, #4f46e5)",
                  cursor: loading ? "not-allowed" : "pointer"
                }}
              >
                {loading ? "Saving..." : "Save Subject"}
              </button>
            </form>
          </div>
        )}

        {/* Subjects Enrolled Grid */}
        <div>
          <h3 style={{ margin: "0 0 20px", fontSize: "18px", fontWeight: "600", color: "#f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Subjects Enrolled</span>
            <span style={{ fontSize: "13px", color: "#9ca3af", fontWeight: "500" }}>Calculations based on {targetPercent}% Target</span>
          </h3>

          {attendanceList.length === 0 ? (
            <div style={{
              backgroundColor: "#111827",
              border: "1px dashed #374151",
              borderRadius: "12px",
              padding: "50px 20px",
              textAlign: "center",
              color: "#9ca3af"
            }}>
              <svg style={{ width: "40px", height: "40px", margin: "0 auto 10px", color: "#4b5563" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p style={{ margin: "0", fontSize: "15px", color: "#e5e7eb" }}>No subjects added yet.</p>
              <p style={{ margin: "5px 0 0", fontSize: "13px", color: "#9ca3af" }}>Click "Add Subject" above to register course details.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "25px" }}>
              {attendanceList.map((item) => {
                const theoryStats = calculateStats(item.theoryConducted, item.theoryAttended);
                const labStats = item.hasLab ? calculateStats(item.labConducted, item.labAttended) : null;

                return (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: "#111827",
                      border: "1px solid #1f2937",
                      borderRadius: "12px",
                      padding: "24px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      position: "relative",
                    }}
                  >
                    {/* Delete icon */}
                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{
                        position: "absolute",
                        top: "18px",
                        right: "18px",
                        background: "none",
                        border: "none",
                        color: "#4b5563",
                        cursor: "pointer",
                        fontSize: "14px",
                        padding: "4px",
                        borderRadius: "4px",
                        transition: "color 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = "#ef4444"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "#4b5563"}
                      title="Delete record"
                    >
                      <svg style={{ width: "16px", height: "16px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>

                    <div>
                      {/* Subject Title */}
                      <h4 style={{ margin: "0 0 20px", fontSize: "20px", fontWeight: "700", color: "#ffffff", paddingRight: "30px", letterSpacing: "-0.5px" }}>
                        {item.subject}
                      </h4>

                      {/* THEORY SECTION */}
                      <div style={{ marginBottom: item.hasLab ? "25px" : "10px", paddingBottom: item.hasLab ? "20px" : "0", borderBottom: item.hasLab ? "1px solid #1f2937" : "none" }}>
                        {item.hasLab && <h5 style={{ margin: "0 0 8px", fontSize: "12px", color: "#818cf8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>Theory</h5>}
                        
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                          <span style={{ fontSize: "28px", fontWeight: "800", color: theoryStats.status === "Safe" ? "#34d399" : "#f87171" }}>
                            {theoryStats.percentage}%
                          </span>
                          <span style={{ fontSize: "13px", color: "#9ca3af" }}>
                            {item.theoryAttended} / {item.theoryConducted} classes
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ width: "100%", height: "6px", backgroundColor: "#1f2937", borderRadius: "3px", overflow: "hidden", marginBottom: "15px" }}>
                          <div style={{
                            width: `${Math.min(theoryStats.percentage, 100)}%`,
                            height: "100%",
                            borderRadius: "3px",
                            backgroundColor: theoryStats.status === "Safe" ? "#10b981" : "#ef4444",
                            transition: "width 0.5s ease"
                          }} />
                        </div>

                        {/* Status Message */}
                        <div style={{
                          backgroundColor: theoryStats.status === "Safe" ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
                          border: `1px solid ${theoryStats.status === "Safe" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)"}`,
                          borderRadius: "6px",
                          padding: "10px 12px",
                          marginBottom: "15px",
                          fontSize: "13px"
                        }}>
                          <div style={{ display: "flex", gap: "6px", alignItems: "center", color: theoryStats.status === "Safe" ? "#34d399" : "#f87171", fontWeight: "700", marginBottom: "4px" }}>
                            <span>
                              {theoryStats.status === "Safe" ? (
                                <svg style={{ width: "14px", height: "14px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              ) : (
                                <svg style={{ width: "14px", height: "14px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                              )}
                            </span>
                            <span>{theoryStats.status.toUpperCase()}</span>
                          </div>
                          <span style={{ color: "#cbd5e1" }}>
                            {theoryStats.status === "Safe" ? (
                              <>Safe to miss the next <strong>{theoryStats.classesMissable}</strong> classes.</>
                            ) : (
                              <>Attend next <strong>{theoryStats.classesNeeded}</strong> classes consecutively.</>
                            )}
                          </span>
                        </div>

                        {/* Quick increment + WhatsApp buttons for Theory */}
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            onClick={() => handleQuickIncrement(item, "present", "theory")}
                            style={{ ...quickButtonStyle, borderColor: "#10b981", color: "#34d399" }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(16, 185, 129, 0.08)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => handleQuickIncrement(item, "absent", "theory")}
                            style={{ ...quickButtonStyle, borderColor: "#ef4444", color: "#f87171" }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.08)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                          >
                            Absent
                          </button>
                          <button
                            onClick={() => triggerWhatsAppAlert(item, "Theory", theoryStats)}
                            style={alertButtonStyle}
                            title="Send Theory alert to WhatsApp"
                          >
                            <svg style={{ width: "14px", height: "14px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* LAB SECTION */}
                      {item.hasLab && labStats && (
                        <div style={{ marginTop: "15px", marginBottom: "10px" }}>
                          <h5 style={{ margin: "0 0 8px", fontSize: "12px", color: "#0891b2", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>Practical / Lab</h5>
                          
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                            <span style={{ fontSize: "28px", fontWeight: "800", color: labStats.status === "Safe" ? "#22d3ee" : "#f87171" }}>
                              {labStats.percentage}%
                            </span>
                            <span style={{ fontSize: "13px", color: "#9ca3af" }}>
                              {item.labAttended} / {item.labConducted} labs
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div style={{ width: "100%", height: "6px", backgroundColor: "#1f2937", borderRadius: "3px", overflow: "hidden", marginBottom: "15px" }}>
                            <div style={{
                              width: `${Math.min(labStats.percentage, 100)}%`,
                              height: "100%",
                              borderRadius: "3px",
                              backgroundColor: labStats.status === "Safe" ? "#06b6d4" : "#ef4444",
                              transition: "width 0.5s ease"
                            }} />
                          </div>

                          {/* Status Message */}
                          <div style={{
                            backgroundColor: labStats.status === "Safe" ? "rgba(6, 182, 212, 0.08)" : "rgba(239, 68, 68, 0.08)",
                            border: `1px solid ${labStats.status === "Safe" ? "rgba(6, 182, 212, 0.15)" : "rgba(239, 68, 68, 0.15)"}`,
                            borderRadius: "6px",
                            padding: "10px 12px",
                            marginBottom: "15px",
                            fontSize: "13px"
                          }}>
                            <div style={{ display: "flex", gap: "6px", alignItems: "center", color: labStats.status === "Safe" ? "#22d3ee" : "#f87171", fontWeight: "700", marginBottom: "4px" }}>
                              <span>
                                {labStats.status === "Safe" ? (
                                  <svg style={{ width: "14px", height: "14px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                ) : (
                                  <svg style={{ width: "14px", height: "14px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                )}
                              </span>
                              <span>{labStats.status.toUpperCase()}</span>
                            </div>
                            <span style={{ color: "#cbd5e1" }}>
                              {labStats.status === "Safe" ? (
                                <>Safe to miss the next <strong>{labStats.classesMissable}</strong> lab sessions.</>
                              ) : (
                                <>Attend next <strong>{labStats.classesNeeded}</strong> lab sessions consecutively.</>
                              )}
                            </span>
                          </div>

                          {/* Quick increment + WhatsApp buttons for Lab */}
                          <div style={{ display: "flex", gap: "10px" }}>
                            <button
                              onClick={() => handleQuickIncrement(item, "present", "lab")}
                              style={{ ...quickButtonStyle, borderColor: "#06b6d4", color: "#22d3ee" }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(6, 182, 212, 0.08)"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                            >
                              Present
                            </button>
                            <button
                              onClick={() => handleQuickIncrement(item, "absent", "lab")}
                              style={{ ...quickButtonStyle, borderColor: "#ef4444", color: "#f87171" }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.08)"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                            >
                              Absent
                            </button>
                            <button
                              onClick={() => triggerWhatsAppAlert(item, "Lab", labStats)}
                              style={alertButtonStyle}
                              title="Send Lab alert to WhatsApp"
                            >
                              <svg style={{ width: "14px", height: "14px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Inline styles helpers
const inputStyle = {
  padding: "12px 16px",
  backgroundColor: "#0f172a",
  border: "1px solid #1f2937",
  borderRadius: "8px",
  color: "#f8fafc",
  fontSize: "15px",
  outline: "none",
  transition: "border-color 0.2s",
  width: "100%",
  boxSizing: "border-box"
};

const buttonStyle = {
  padding: "12px",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontSize: "16px",
  fontWeight: "600",
  marginTop: "10px",
  transition: "all 0.2s ease"
};

const quickButtonStyle = {
  flex: 2,
  padding: "8px",
  backgroundColor: "transparent",
  border: "1px solid",
  borderRadius: "6px",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s"
};

const alertButtonStyle = {
  flex: 1,
  padding: "8px",
  backgroundColor: "#1f2937",
  border: "1px solid #374151",
  color: "#e2e8f0",
  borderRadius: "6px",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  transition: "opacity 0.2s"
};

export default Attendance;