import React, { useState } from 'react';
import { authAPI, userAPI } from '../services/api';

function Login({ onNavigate, onAuth }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      // Call real API
      await authAPI.login(username, password);
      // Get user info
      const userData = await userAPI.getMe();
      if (onAuth) {
        onAuth({ username: userData.username, email: userData.email, role: userData.role || 'user' });
      }
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="card p-4 rounded-3 shadow-sm">
      <h2 className="text-center mb-4">Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Username</label>
          <input
            type="text"
            className="form-control"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            id="exampleInputPassword1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="text-danger mb-2">{error}</div>}
        <button type="submit" className="btn btn-primary w-100">Login</button>
      </form>
      <p className="text-center mt-3 mb-0">
        Don't have an account? <a href="#" onClick={() => onNavigate('signup')}>Sign Up</a>
      </p>
    </div>
  );
}

export default Login;