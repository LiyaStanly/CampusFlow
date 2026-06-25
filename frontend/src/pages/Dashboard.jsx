import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    fetchTasks();
    fetchAttendance();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/task");
      setTasks(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await axios.get("http://localhost:5000/attendance");
      setAttendance(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const atRiskCount = attendance.filter((item) => {
    if (item.hasLab) {
      return item.theoryPercent < 75 || item.labPercent < 75;
    }
    return item.theoryPercent < 75;
  }).length;


  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ flex: 1, padding: "30px" }}>
        <h1>Welcome to CampusFlow 🎓</h1>

        <div
          style={{
            display: "flex",
            gap: "20px",
            marginTop: "30px",
          }}
        >
          <div style={cardStyle}>
            <h3>Total Tasks</h3>
            <h1>{tasks.length}</h1>
          </div>

          <div style={cardStyle}>
            <h3>Pending Tasks</h3>
            <h1>{tasks.length}</h1>
          </div>

          <div style={{
            ...cardStyle,
            borderColor: atRiskCount > 0 ? "#ef4444" : "#ddd",
            backgroundColor: atRiskCount > 0 ? "rgba(239, 68, 68, 0.05)" : "transparent"
          }}>
            <h3>Attendance Alerts</h3>
            <h1 style={{ color: atRiskCount > 0 ? "#ef4444" : "inherit" }}>{atRiskCount}</h1>
            <p style={{ fontSize: "14px", color: atRiskCount > 0 ? "#f87171" : "#10b981", fontWeight: "600" }}>
              {atRiskCount > 0 ? `${atRiskCount} Subjects At Risk` : "All subjects safe"}
            </p>
          </div>

          <div style={cardStyle}>
            <h3>AI Tip</h3>
            <p>Complete one task at a time.</p>
          </div>
        </div>

        <h2 style={{ marginTop: "40px" }}>
          Upcoming Deadlines
        </h2>

        {tasks.map((task, index) => (
          <div key={index} style={taskCard}>
            <h3>{task.title}</h3>

            <p>Subject: {task.subject}</p>

            <p>
              Deadline:{" "}
              {new Date(task.deadline).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const cardStyle = {
  width: "250px",
  padding: "20px",
  border: "1px solid #ddd",
  borderRadius: "10px",
};

const taskCard = {
  border: "1px solid #ddd",
  padding: "15px",
  borderRadius: "10px",
  marginTop: "15px",
};

export default Dashboard;