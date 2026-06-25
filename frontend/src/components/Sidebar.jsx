import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div
      style={{
        width: "250px",
        height: "100vh",
        backgroundColor: "#1e293b",
        color: "white",
        padding: "20px",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "40px" }}>
        CampusFlow
      </h2>

      <nav style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
      </nav>
    </div>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
  padding: "10px",
  borderRadius: "5px",
  backgroundColor: "#334155",
};

export default Sidebar;