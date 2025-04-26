import React from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { login } from "../../app/actions/user.actions";
import LoginImage from "../../assets/login.png";

function Login() {
  const dispatch = useDispatch();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = {
      username,
      password,
    };
    dispatch(login(user));
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center min-vh-100"
      style={{
        backgroundImage: `url(${LoginImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="card p-4 shadow-lg"
        style={{ maxWidth: "500px", width: "100%", backdropFilter: "blur(6px)", backgroundColor: "#ffffffd6", borderRadius: "1rem" }}
      >
        <div className="text-center mb-4">
          <h2 className="fw-bold">Welcome Back!</h2>
          <p className="text-muted">Login to continue</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Username</label>
            <input
              type="text"
              className="form-control rounded-pill px-3"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Password</label>
            <input
              type="password"
              className="form-control rounded-pill px-3"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="d-grid mb-3">
            <button type="submit" className="btn btn-primary rounded-pill py-2">
              LOGIN
            </button>
          </div>
        </form>
        <div className="text-center">
          <Link to="/forgotpassword" className="text-decoration-none text-primary">
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;