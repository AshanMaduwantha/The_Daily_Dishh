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

  const handleGoogleLogin = () => {
    // Handle Google login logic here
    console.log("Google login clicked");
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center min-vh-100"
      style={{
        backgroundImage: `url()`,
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
            <button
              type="submit"
              className="btn rounded-pill py-2"
              style={{ backgroundColor: "#fd7e14", borderColor: "#fd7e14", color: "#fff" }}
            > 
              LOGIN
            </button>
          </div>
          <div className="d-grid mb-3">
            <button
              type="button"
              className="btn rounded-pill py-2 d-flex align-items-center justify-content-center"
              style={{ 
                background: "white", 
                border: "1px solid #ddd",
                boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
              }}
              onClick={handleGoogleLogin}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48" className="me-2">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span style={{ 
                color: "#757575", 
                fontWeight: "500", 
                fontSize: "14px" 
              }}>CONTINUE WITH GOOGLE</span>
            </button>
          </div>
        </form>
        <div className="text-center">
          <Link to="/forgotpassword" className="text-decoration-none text-primary">
            Forgot Password?
          </Link>
        </div>
        <div className="text-center">
          <Link to="/signup" className="text-decoration-none text-primary">
            Don't have an account? Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;