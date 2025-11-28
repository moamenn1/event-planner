import React, { useState } from 'react';
import { authAPI } from '../services/api';

function SignUp({ onNavigate, onAuth }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user"); // default to normal user
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setError("");
    
    try {
      // Call real API
      console.log("Attempting signup...");
      const userData = await authAPI.signup(username, email, password, role);
      console.log("Signup successful, attempting auto-login...");
      
      // Auto-login after signup
      try {
        const loginData = await authAPI.login(username, password);
        console.log("Login successful!");
        if (onAuth) {
          onAuth({ username, email, role });
        }
      } catch (loginErr) {
        console.error("Login error:", loginErr);
        setError("Account created but login failed: " + (loginErr.message || "Please try logging in manually."));
        // Navigate to login page after a delay
        setTimeout(() => {
          if (onNavigate) onNavigate('login');
        }, 2000);
      }
    } catch (err) {
      console.error("Signup error:", err);
      const errorMsg = err.message || "Signup failed. Please try again.";
      setError(errorMsg.includes("already exists") ? "Username or email already exists. Try a different one." : errorMsg);
    }
  };

  // SVGs for icons
  const userIcon = (
    <svg width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
      <path fillRule="evenodd" d="M8 9a5 5 0 0 0-5 5v.5a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V14a5 5 0 0 0-5-5z"/>
    </svg>
  );
  // Cheerful party popper icon for organizer
  const organizerIcon = (
    <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g>
        <path d="M12 52l12-36 24 24-36 12z" fill="#FFD93B" stroke="#F4B400" strokeWidth="2"/>
        <path d="M24 16l24 24" stroke="#F4B400" strokeWidth="2"/>
        <circle cx="44" cy="12" r="4" fill="#F4B400"/>
        <circle cx="56" cy="24" r="3" fill="#EA4335"/>
        <circle cx="52" cy="40" r="2.5" fill="#34A853"/>
        <circle cx="36" cy="8" r="2" fill="#4285F4"/>
      </g>
    </svg>
  );

  return (
    <div className="card p-4 rounded-3 shadow-sm">
      <h2 className="text-center mb-4">Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Username</label>
          <input
            type="text"
            className="form-control"
            id="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
          <input
            type="email"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3 position-relative">
          <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
          <div className="position-relative">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control pe-5"
              id="exampleInputPassword1"
              value={password}
              onChange={e => setPassword(e.target.value)}
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
        </div>
        <div className="mb-3 position-relative">
          <label htmlFor="exampleInputPassword2" className="form-label">Confirm Password</label>
          <div className="position-relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="form-control pe-5"
              id="exampleInputPassword2"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
            <span
              className="password-eye"
              onClick={() => setShowConfirmPassword(v => !v)}
              tabIndex={0}
              role="button"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? (
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
        <div className="mb-3">
          <label className="form-label">Role</label>
          <div className="d-flex gap-3">
            <div
              className={`flex-fill card p-2 text-center ${role === 'user' ? 'border-primary border-2' : 'border-light'} role-selectable`}
              style={{ cursor: 'pointer', minWidth: 0 }}
              onClick={() => setRole('user')}
            >
              <div className="mb-1">{userIcon}</div>
              <div>User</div>
            </div>
            <div
              className={`flex-fill card p-2 text-center ${role === 'organizer' ? 'border-primary border-2' : 'border-light'} role-selectable`}
              style={{ cursor: 'pointer', minWidth: 0 }}
              onClick={() => setRole('organizer')}
            >
              <div className="mb-1">{organizerIcon}</div>
              <div>Organizer</div>
            </div>
          </div>
        </div>
  <button type="submit" className="btn btn-primary w-100">Sign Up</button>
      </form>
      <p className="text-center mt-3 mb-0">
        Already have an account? <a href="#" onClick={() => onNavigate('login')}>Login</a>
      </p>
    </div>
  );
}

export default SignUp;