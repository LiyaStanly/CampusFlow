import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div
      style={{
        width: "250px",
        height: "100vh",
        backgroundColor: "#0f172a",
        color: "white",
        padding: "20px",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "40px" }}>
        CampusFlow 🎓
      </h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <Link to="/dashboard" style={linkStyle}>
          🏠 Dashboard
        </Link>

        <Link to="/add-task" style={linkStyle}>
          📝 Add Task
        </Link>

        <Link to="/notice" style={linkStyle}>
          📣 Notice AI
        </Link>

        <Link to="/attendance" style={linkStyle}>
          ⚠ Attendance
        </Link>

        <Link to="/logs" style={linkStyle}>
          ⚙ Automation Logs
        </Link>
      </div>
    </div>
  );
}

const linkStyle = {
  textDecoration: "none",
  color: "white",
  backgroundColor: "#334155",
  padding: "12px",
  borderRadius: "8px",
};

export default Sidebar;