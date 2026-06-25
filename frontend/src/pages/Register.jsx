import { Link } from "react-router-dom";

function Register() {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      background: "#f3f4f6"
    }}>
      <div style={{
        background: "white",
        padding: "30px",
        width: "400px",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
          Student Registration
        </h1>

        <input
          type="text"
          placeholder="Name"
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <input
          type="email"
          placeholder="Email"
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <input
          type="text"
          placeholder="Phone Number"
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <input
          type="text"
          placeholder="Branch (CSE)"
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <input
          type="text"
          placeholder="Year (3rd Year)"
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <input
          type="text"
          placeholder="Subjects (DBMS, OS, CN)"
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <input
          type="password"
          placeholder="Password"
          style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
        />

        <button style={{
          width: "100%",
          padding: "10px",
          background: "#16a34a",
          color: "white",
          border: "none"
        }}>
          Register
        </button>

        <p style={{ textAlign: "center", marginTop: "15px" }}>
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;