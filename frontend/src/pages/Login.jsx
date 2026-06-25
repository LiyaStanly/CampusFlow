import { Link } from "react-router-dom";

function Login() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h1 className="text-3xl font-bold text-center mb-6">
          CampusFlow
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded mb-4"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded mb-4"
        />

        <button className="w-full bg-blue-600 text-white p-3 rounded">
          Login
        </button>

        <p className="text-center mt-4">
          New User? <Link to="/register" className="text-blue-600">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;