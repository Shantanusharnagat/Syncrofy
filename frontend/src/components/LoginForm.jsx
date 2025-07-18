import React, { useState } from 'react';
import axios from 'axios';
import './LoginForm.css';

function LoginForm({ onLoginSuccess }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('https://syncrofy-backend.onrender.com/api/auth/login', {
        email,
        password,
      });
      onLoginSuccess(res.data.user, res.data.token);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed, please try again.'
      );
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('https://syncrofy-backend.onrender.com/api/auth/register', {
        username,
        email,
        password,
      });
      alert('Registration successful, now log in!');
      setMode('login');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed, please try again.'
      );
    }
  };

  return (
    <div className="login-form">
      <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
      <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
        {mode === 'register' && (
          <input
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        )}
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">{mode === 'login' ? 'Login' : 'Register'}</button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
      <div style={{ marginTop: 10 }}>
        {mode === 'login' ? (
          <>
            Don't have an account?{' '}
            <button onClick={() => setMode('register')}>Register</button>
          </>
        ) : (
          <>
            Already registered?{' '}
            <button onClick={() => setMode('login')}>Login</button>
          </>
        )}
      </div>
    </div>
  );
}

export default LoginForm;
