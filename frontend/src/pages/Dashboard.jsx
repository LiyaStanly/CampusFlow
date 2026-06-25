import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

function Dashboard() {
  const [tasks, setTasks] = useState([]);

    const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/task");
      setTasks(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);


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