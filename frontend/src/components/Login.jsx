import React, { useState } from 'react';
import { authAPI } from '../services/api';

function Login({ onNavigate, onAuth }) {
  const [identifier, setIdentifier] = useState(''); // Can be email or username
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (identifier.includes("@") && !identifier.endsWith("@gmail.com")) {
      setError('Only Gmail addresses are allowed.');
      return;
    }

    try {
      const loginData = await authAPI.login(identifier, password);
      console.log("Login successful!");
      if (onAuth) {
        // Fetch user info from the response or make another call if needed
        onAuth({ username: identifier, email: identifier.includes("@") ? identifier : "", role: "user" });
      }
      if (onNavigate) {
        onNavigate('dashboard');
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || 'Login failed.');
    }
  };

  return (
    <div className="card p-4 rounded-3 shadow-sm">
      <h2 className="text-center mb-4">Login</h2>
      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label htmlFor="identifier" className="form-label">Username or Gmail</label>
          <input
            type="text"
            className="form-control"
            id="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </div>
        <div className="mb-3 position-relative">
          <label htmlFor="password" className="form-label">Password</label>
          <div className="position-relative">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control pe-5"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="password-eye"
              onClick={() => setShowPassword(v => !v)}
              tabIndex={0}
              role="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M13.359 11.238l1.42 1.42a.75.75 0 1 1-1.06 1.06l-1.42-1.42A7.03 7.03 0 0 1 8 14c-4.418 0-7-5.373-7-6s2.582-6 7-6c1.49 0 2.82.37 3.98 1l-1.45 1.45A5.98 5.98 0 0 0 8 4C4.818 4 2.5 8 2.5 8s2.318 4 5.5 4c.69 0 1.35-.13 1.96-.36l1.399 1.398zm-2.12-2.12A2.5 2.5 0 0 1 8 10.5a2.5 2.5 0 0 1-2.5-2.5c0-.69.28-1.32.74-1.78l1.42 1.42a.75.75 0 1 0 1.06-1.06l-1.42-1.42A2.5 2.5 0 0 1 8 5.5c.69 0 1.32.28 1.78.74l1.44-1.44A5.98 5.98 0 0 1 13.5 8c0 .69-.13 1.35-.36 1.96l-1.399-1.398z"/></svg>
              ) : (
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8s-2.582 6-8 6-8-6-8-6 2.582-6 8-6 8 6 8 6zm-8 4a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/></svg>
              )}
            </span>
          </div>
          {error && (
            <div className="text-danger mt-2" style={{ fontSize: '0.95em' }}>{error}</div>
          )}
        </div>
        <button type="submit" className="btn btn-primary w-100">Login</button>
      </form>
      <p className="text-center mt-3 mb-0">
        Don't have an account? <a href="#" onClick={() => onNavigate('signup')}>Sign Up</a>
      </p>
    </div>
  );
}

export default Login;