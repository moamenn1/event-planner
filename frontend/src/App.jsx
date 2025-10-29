import React, { useState } from 'react';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Logo from './components/Logo';
import LandingPage from './components/LandingPage';

function App() {
  const [currentPage, setCurrentPage] = useState('signup');
  const [user, setUser] = useState(null); // { username, role }

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  // Simulate login/signup by setting user state
  const handleAuth = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('signup');
  };

  // Show landing page dashboard when logged in
  if (user && currentPage === 'dashboard') {
    return (
      <LandingPage
        user={user}
        onLogout={handleLogout}
        onShowSignUp={() => setCurrentPage('signup')}
        onShowSignIn={() => setCurrentPage('login')}
      />
    );
  }

  // Show auth forms with logo
  return (
    <div className="app-vertical-center d-flex flex-column align-items-center justify-content-center min-vh-100" style={{ minHeight: '100vh' }}>
      <Logo />
      <div className="w-100 d-flex justify-content-center">
        <div className="col-12 col-sm-8 col-md-6 col-lg-4" style={{ maxWidth: 480 }}>
          {currentPage === 'signup' ? (
            <SignUp onNavigate={handleNavigate} onAuth={handleAuth} />
          ) : (
            <Login onNavigate={handleNavigate} onAuth={handleAuth} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
