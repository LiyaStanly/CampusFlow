import { useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";

function AddTask() {
  const [task, setTask] = useState({
    title: "",
    subject: "",
    deadline: "",
    reminderTime: "",
  });

  const handleChange = (e) => {
    setTask({
      ...task,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/task",
        task
      );

      alert(res.data.message);

      setTask({
        title: "",
        subject: "",
        deadline: "",
        reminderTime: "",
      });
    } catch (error) {
      console.log(error);
      alert("Error adding task");
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ padding: "30px", width: "100%" }}>
        <h1>Add New Task</h1>

        <div style={formStyle}>
          <input
            type="text"
            placeholder="Task Title"
            name="title"
            value={task.title}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Subject"
            name="subject"
            value={task.subject}
            onChange={handleChange}
            style={inputStyle}
          />

          <label>Deadline</label>

          <input
            type="datetime-local"
            name="deadline"
            value={task.deadline}
            onChange={handleChange}
            style={inputStyle}
          />

          <label>Reminder Time</label>

          <input
            type="datetime-local"
            name="reminderTime"
            value={task.reminderTime}
            onChange={handleChange}
            style={inputStyle}
          />

          <button onClick={handleSubmit} style={buttonStyle}>
            Save Task
          </button>
        </div>
      </div>
    </div>
  );
}

const formStyle = {
  marginTop: "30px",
  display: "flex",
  flexDirection: "column",
  width: "500px",
  gap: "15px",
};

const inputStyle = {
  padding: "12px",
};

const buttonStyle = {
  padding: "12px",
  background: "#2563eb",
  color: "white",
  border: "none",
  cursor: "pointer",
};

export default AddTask;