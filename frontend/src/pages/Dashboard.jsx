import Sidebar from "../components/Sidebar";

function Dashboard() {
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
            <h1>8</h1>
          </div>

          <div style={cardStyle}>
            <h3>Pending Tasks</h3>
            <h1>3</h1>
          </div>

          <div style={cardStyle}>
            <h3>AI Tip</h3>
            <p>Start preparing for OS internals today.</p>
          </div>
        </div>

        <h2 style={{ marginTop: "40px" }}>Upcoming Deadlines</h2>

        <div style={deadlineStyle}>
          <h3>OS Assignment</h3>
          <p>25 June 2026</p>
        </div>

        <div style={deadlineStyle}>
          <h3>DBMS Project</h3>
          <p>28 June 2026</p>
        </div>

        <div style={deadlineStyle}>
          <h3>CN Quiz</h3>
          <p>29 June 2026</p>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  border: "1px solid #ddd",
  padding: "20px",
  borderRadius: "10px",
  width: "250px",
  boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
};

const deadlineStyle = {
  border: "1px solid #ddd",
  marginTop: "15px",
  padding: "15px",
  borderRadius: "10px",
};

export default Dashboard;