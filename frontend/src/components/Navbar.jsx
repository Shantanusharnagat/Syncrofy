import React, { useState, useRef, useEffect } from 'react';
import './Navbar.css';

function Navbar({ user, onLogin, onAboutUs, onInvite, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  return (
    <nav className="navbar">
      <div className="navbar-logo">Syncrofy</div>
      <div className="navbar-buttons">
        <button className="navbar-btn" onClick={onAboutUs}>About Us</button>
        {user && <button className="navbar-btn" onClick={onInvite}>Invite</button>}
        {/* <button className="navbar-btn" onClick={onInvite}>Invite</button> */}
        {!user ? (
          <button className="navbar-btn navbar-btn-primary" onClick={onLogin}>Login</button>
        ) : (
          <div className="navbar-user-dropdown" ref={dropdownRef}>
            <button
              className="navbar-btn navbar-btn-user"
              onClick={() => setDropdownOpen(v => !v)}
            >
              {user.username} &#x25BC;
            </button>
            {dropdownOpen && (
              <div className="navbar-dropdown-menu">
                <button className="navbar-dropdown-item" onClick={onLogout}>Logout</button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
