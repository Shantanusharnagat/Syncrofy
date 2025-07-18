import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Editor from './Editor';
import LoginForm from './components/LoginForm';
import './App.css';

// Helper component to handle "/doc/:id" and pass correct props to Editor
function EditorWrapper({ user }) {
  const { id: documentId } = useParams();
  return <Editor token={localStorage.getItem('token')} documentId={documentId} />;
}

// Redirect "/" or any route without doc ID to a new doc
function NewDocRedirect() {
  const navigate = useNavigate();
  React.useEffect(() => {
    const newId = Math.random().toString(36).substring(2, 10);
    navigate(`/doc/${newId}`, { replace: true });
  }, [navigate]);
  return null;
}

// The main App logic
function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null);

  // Invite button copies current browser doc URL
  const handleInvite = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Invite link copied!');
  };

  const handleLoginSuccess = (userData, token) => {
    setUser(userData);
    setShowLogin(false);
    localStorage.setItem('token', token);
  };

  return (
    <BrowserRouter>
      <Navbar
        user={user}
        onLogin={() => setShowLogin(true)}
        onAboutUs={() => alert('Syncrofy: Real-time collaborative editing!')}
        onInvite={handleInvite}
        onLogout={() => {
          localStorage.removeItem('token');
          setUser(null);
        }}
      />

      <main className="editor-container">
        <Routes>
          <Route
            path="/doc/:id"
            element={
              user ? (
                <EditorWrapper user={user} />
              ) : (
                <div style={{ textAlign: 'center', marginTop: 40 }}>
                  <h2>Welcome to Syncrofy!</h2>
                  <p>Please log in to collaborate in real time.</p>
                </div>
              )
            }
          />
          <Route
            path="*"
            element={
              user ? (
                <NewDocRedirect />
              ) : (
                <div style={{ textAlign: 'center', marginTop: 40 }}>
                  <h2>Welcome to Syncrofy!</h2>
                  <p>Please log in to collaborate in real time.</p>
                </div>
              )
            }
          />
        </Routes>
      </main>
      {showLogin && (
        <div className="modal-backdrop">
          <div className="modal">
            <LoginForm onLoginSuccess={handleLoginSuccess} />
            <button
              onClick={() => setShowLogin(false)}
              style={{ marginTop: '1rem' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </BrowserRouter>
  );
}

export default App;
