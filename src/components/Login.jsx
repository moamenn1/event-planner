import React, { useState } from 'react';

function Login({ onNavigate, onAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock login: determine role based on email
    const mockRole = email.includes("organizer") ? "organizer" : "user";
    const username = email.split("@")[0];
    if (onAuth) {
      onAuth({ username, email, role: mockRole });
    }
  };

  return (
    <div className="card p-4 rounded-3 shadow-sm">
      <h2 className="text-center mb-4">Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
          <input
            type="email"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        <button type="submit" className="btn btn-primary w-100">Login</button>
      </form>
      <p className="text-center mt-3 mb-0">
        Don't have an account? <a href="#" onClick={() => onNavigate('signup')}>Sign Up</a>
      </p>
    </div>
  );
}

export default Login;