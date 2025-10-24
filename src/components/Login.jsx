import React from 'react';

function Login({ onNavigate }) {
  return (
    <div className="card p-4 rounded-3 shadow-sm">
      <h2 class="text-center mb-4">Login</h2>
      <form>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
          <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
          <input type="password" className="form-control" id="exampleInputPassword1" />
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